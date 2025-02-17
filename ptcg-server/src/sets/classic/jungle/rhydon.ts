import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, PlayerType, StateUtils, Attack, ChoosePokemonPrompt, GameMessage, SlotType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AfterDamageEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';


function* useRam(next: Function, store: StoreLike, state: State, effect: AfterDamageEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const selfDamageEffect = new PutDamageEffect(effect.attackEffect, 20);
  selfDamageEffect.target = effect.source;
  state = store.reduceEffect(state, selfDamageEffect);

  if (store.hasPrompts()) {
    yield store.waitPrompt(state, () => next());
  }

  const opponentHasBenched = opponent.bench.some(b => b.cards.length > 0);
  if (!opponentHasBenched) {
    return state;
  }

  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_NEW_ACTIVE_POKEMON,
    PlayerType.TOP_PLAYER,
    [SlotType.BENCH],
    { allowCancel: false },
  ), selected => {
    if (!selected || selected.length === 0) {
      return state;
    }

    const target = selected[0];
    opponent.switchPokemon(target);
    next();
  });

  return state;
}

export class Rhydon extends PokemonCard {

  public id: number = 45;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Rhyhorn';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 100;

  public weakness: Weakness[] = [{ type: CardType.GRASS }];

  public resistance: Resistance[] = [{ type: CardType.LIGHTNING, value: -30 }];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Horn Attack',
    cost: [CardType.FIGHTING, CardType.COLORLESS, CardType.COLORLESS],
    damage: 30,
    text: ''
  }, {
    name: 'Ram',
    cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING],
    damage: 50,
    text: 'Rhydon does 20 damage to itself. ' +
      'If your opponent has any Benched Pokémon, he or she chooses ' +
      '1 of them and switches it with the Defending Pokémon. ' +
      '(Do the damage before switching the Pokémon. ' +
      'Switch the Pokémon even if Rhydon is knocked out.)'
  }];

  public set: string = 'JU';

  public name: string = 'Rhydon';

  public fullName: string = 'Rhydon JU';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Ram
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const generator = useRam(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
