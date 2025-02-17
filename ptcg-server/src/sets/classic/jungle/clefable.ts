import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Attack, ChooseAttackPrompt, StateUtils, PlayerType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameLog, GameMessage } from '../../../game/game-message';
import { DealDamageEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';


function* useMetronome(next: Function, store: StoreLike, state: State,
  effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const pokemonCard = opponent.active.getPokemonCard();

  if (pokemonCard === undefined || pokemonCard.attacks.length === 0) {
    return state;
  }

  let selected: any;
  yield store.prompt(state, new ChooseAttackPrompt(
    player.id,
    GameMessage.CHOOSE_ATTACK_TO_COPY,
    [pokemonCard],
    { allowCancel: false }
  ), result => {
    selected = result;
    next();
  });

  const attack: Attack | null = selected;

  if (attack === null) {
    return state;
  }

  store.log(state, GameLog.LOG_PLAYER_COPIES_ATTACK, {
    name: player.name,
    attack: attack.name
  });

  // Perform attack
  const attackEffect = new AttackEffect(player, opponent, attack);
  store.reduceEffect(state, attackEffect);

  if (store.hasPrompts()) {
    yield store.waitPrompt(state, () => next());
  }

  if (attackEffect.damage > 0) {
    const dealDamage = new DealDamageEffect(attackEffect, attackEffect.damage);
    state = store.reduceEffect(state, dealDamage);
  }

  return state;
}

export class Clefable extends PokemonCard {

  public id: number = 1;

  public stage: Stage = Stage.STAGE_1;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 70;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [
    {
      name: 'Metronome',
      cost: [CardType.COLORLESS],
      damage: 0,
      text:
        'Choose 1 of the Defending Pokémon\'s attacks. ' +
        'Metronome copies that attack except for its Energy costs ' +
        'and anything else required in order to use that attack, ' +
        'such as discarding Energy cards. ' +
        '(No matter what type the Defending Pokémon is, Clefable\'s type is still Colorless.)'
    },
    {
      name: 'Minimize',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: 0,
      text:
        'All damage done by attacks to Clefable during your opponent\'s next turn is reduced by 20 ' +
        '(after applying Weakness and Resistance).'
    }
  ];

  public set: string = 'JU';

  public name: string = 'Clefable';

  public fullName: string = 'Clefable JU';

  public readonly MINIMIZE_MARKER = 'MINIMIZE_MARKER';

  public readonly CLEAR_MINIMIZE_MARKER = 'CLEAR_MINIMIZE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Metronome
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useMetronome(() => generator.next(), store, state, effect);
      return generator.next().value;
    }


    // Minimize
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      state = store.prompt(state, new CoinFlipPrompt(
        player.id,
        GameMessage.COIN_FLIP
      ), flipResult => {
        if (flipResult) {
          player.active.marker.addMarker(this.MINIMIZE_MARKER, this);
          opponent.marker.addMarker(this.CLEAR_MINIMIZE_MARKER, this);
        }
      });

      return state;
    }

    if (effect instanceof PutDamageEffect && effect.target.marker.hasMarker(this.MINIMIZE_MARKER)) {
      effect.damage -= 20;
      return state;
    }

    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_MINIMIZE_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_MINIMIZE_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.MINIMIZE_MARKER, this);
      });
    }

    return state;
  }

}
