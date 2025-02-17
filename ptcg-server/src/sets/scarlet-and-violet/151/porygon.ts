import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, GameMessage, SelectPrompt, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { CheckPokemonStatsEffect } from '../../../game/store/effects/check-effects';

export class Porygon extends PokemonCard {

  public id: number = 137;

  public stage: Stage = Stage.BASIC;

  public cardTypes: CardType[] = [CardType.COLORLESS];

  public hp: number = 60;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Conversion 4',
    cost: [CardType.COLORLESS],
    damage: 0,
    text:
      'Choose {G}, {R}, {W}, {L}, {P}, {F}, {D}, {M}, or {N} type. ' +
      'Until the Defending Pokémon leaves the Active Spot, its Weakness is now that type. ' +
      '(The amount of Weakness doesn\'t change.)'
  }];

  public set: string = 'MEW';

  public name: string = 'Porygon';

  public fullName: string = 'Porygon MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Conversion 4
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const checkPokemonStatsEffect = new CheckPokemonStatsEffect(opponent.active);
      store.reduceEffect(state, checkPokemonStatsEffect);

      const defendingCard = opponent.active.getPokemonCard();

      if (defendingCard === undefined) {
        return state;
      }

      const options: { message: string, value: CardType }[] = [
        { message: 'LABEL_GRASS', value: CardType.GRASS },
        { message: 'LABEL_FIRE', value: CardType.FIRE },
        { message: 'LABEL_WATER', value: CardType.WATER },
        { message: 'LABEL_LIGHTNING', value: CardType.LIGHTNING },
        { message: 'LABEL_PSYCHIC', value: CardType.PSYCHIC },
        { message: 'LABEL_FIGHTING', value: CardType.FIGHTING },
        { message: 'LABEL_DARKNESS', value: CardType.DARKNESS },
        { message: 'LABEL_METAL', value: CardType.METAL },
        { message: 'LABEL_DRAGON', value: CardType.DRAGON },
        // { message: 'LABEL_FAIRY', value: CardType.FAIRY },
      ];

      return store.prompt(state, new SelectPrompt(
        player.id,
        GameMessage.CHOOSE_SPECIAL_CONDITION,
        options.map(c => c.message),
        { allowCancel: false }
      ), choice => {
        const selected = options[choice];

        if (selected !== undefined) {
          defendingCard.weakness = [{ type: selected.value }];
        }
      });
    }

    return state;
  }
}
