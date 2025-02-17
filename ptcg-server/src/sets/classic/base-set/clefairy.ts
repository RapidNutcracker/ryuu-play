import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, CoinFlipPrompt, Resistance, Attack, ChooseAttackPrompt, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { GameLog, GameMessage } from '../../../game/game-message';
import { AddSpecialConditionsEffect, DealDamageEffect } from '../../../game/store/effects/attack-effects';


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

export class Clefairy extends PokemonCard {

  public id: number = 5;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 40;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance: Resistance[] = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Sing',
      cost: [CardType.COLORLESS],
      damage: 0,
      text: 'Flip a coin. If heads, the Defending Pokémon is now Asleep.'
    },
    {
      name: 'Metronome',
      cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
      damage: 0,
      text: 'Choose 1 of the Defending Pokémon\'s attacks. Metronome copies that attack except for its Energy costs and anything else required in order to use that attack, such as discarding Energy cards. (No matter what type the Defending Pokémon is, Clefairy\'s type is still Colorless.)'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Clefairy';

  public fullName: string = 'Clefairy BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Sing
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.ASLEEP]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    // Metronome
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = useMetronome(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
