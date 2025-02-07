import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { State, StateUtils, StoreLike } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AfterDamageEffect } from '../../game/store/effects/attack-effects';

export class Aerodactyl extends PokemonCard {

  public id: number = 142;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Antique Old Amber';

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 130;

  public weakness = [{ type: CardType.LIGHTNING }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public attacks = [{
    name: 'Glide',
    cost: [CardType.COLORLESS],
    damage: 30,
    text: ''
  }, {
    name: 'Devolution Ray',
    cost: [CardType.FIGHTING],
    damage: 100,
    text:
      'If your opponent\'s Active Pokémon is an evolved Pokémon, ' +
      'devolve it by putting the highest Stage Evolution card on it into your opponent\'s hand.'
  }];

  public set: string = 'MEW';

  public name: string = 'Aerodactyl';

  public fullName: string = 'Aerodactyl MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Devolution Ray
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const defendingPokemon = effect.target.getPokemonCard();
      if (defendingPokemon && (defendingPokemon.stage === Stage.STAGE_1 || defendingPokemon.stage === Stage.STAGE_2)) {
        opponent.active.moveCardTo(defendingPokemon, opponent.hand);
      }
    }

    return state;
  }
}
