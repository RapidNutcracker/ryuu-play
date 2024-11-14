import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameError, GameMessage, StateUtils, GamePhase } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AfterDamageEffect } from '../../game/store/effects/attack-effects';

export class Machamp extends PokemonCard {

  public id: number = 8;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Machoke';

  public cardType: CardType = CardType.FIGHTING;

  public hp: number = 100;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers = [{
    name: 'Strikes Back',
    useWhenInPlay: true,
    powerType: PowerType.POKEPOWER,
    text: 'Whenever your opponent\'s attack damages Machamp (even if Machamp is Knocked Out), this power does 10 damage to the attacking Pokémon. (Don\'t apply Weakness and Resistance.) This power can\'t be used if Machamp is Asleep, Confused, or Paralyzed when your opponent attacks.'
  }];

  public attacks = [
    { name: 'Seismic Toss', cost: [CardType.FIGHTING, CardType.FIGHTING, CardType.FIGHTING, CardType.COLORLESS], damage: 60, text: '' },
  ];

  public set: string = 'BS';

  public name: string = 'Machamp';

  public fullName: string = 'Machamp BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Strikes Back
    /// TODO: Is this good?
    if (effect instanceof AfterDamageEffect && effect.target.getPokemonCard() === this) {
      const player = effect.player;
      const targetPlayer = StateUtils.findOwner(state, effect.target);

      if (effect.target.specialConditions.length > 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (effect.damage <= 0 || player === targetPlayer) {
        return state;
      }

      if (state.phase === GamePhase.ATTACK) {
        effect.source.damage += 10;
      }
    }

    return state;
  }
}
