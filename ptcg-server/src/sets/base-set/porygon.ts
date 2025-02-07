import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, GameMessage, SelectPrompt, StateUtils } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { CheckPokemonStatsEffect } from '../../game/store/effects/check-effects';

export class Porygon extends PokemonCard {

  public id: number = 39;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 30;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Conversion 1',
      cost: [CardType.COLORLESS],
      damage: 0,
      text: 'If the Defending Pokémon has a Weakness, you may change it to a type of your choice other than Colorless.'
    },
    {
      name: 'Conversion 2',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: 0,
      text: 'Change Porygon\'s Resistance to a type of your choice other than Colorless.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Porygon';

  public fullName: string = 'Porygon BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Conversion 1
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);



      const checkPokemonStatsEffect = new CheckPokemonStatsEffect(opponent.active);
      store.reduceEffect(state, checkPokemonStatsEffect);

      const hasWeakness = checkPokemonStatsEffect.weakness.length > 0;

      if (!hasWeakness) {
        return state;
      }

      const defendingCard = opponent.active.getPokemonCard();

      if (defendingCard === undefined) {
        return state;
      }

      const options: { message: string, value: CardType }[] = [
        { message: 'LABEL_FIRE', value: CardType.FIRE },
        { message: 'LABEL_GRASS', value: CardType.GRASS },
        { message: 'LABEL_FIGHTING', value: CardType.FIGHTING },
        { message: 'LABEL_PSYCHIC', value: CardType.PSYCHIC },
        { message: 'LABEL_WATER', value: CardType.WATER },
        { message: 'LABEL_LIGHTNING', value: CardType.LIGHTNING },
        { message: 'LABEL_METAL', value: CardType.METAL },
        { message: 'LABEL_DARK', value: CardType.DARK },
        { message: 'LABEL_DRAGON', value: CardType.DRAGON },
        { message: 'LABEL_FAIRY', value: CardType.FAIRY },
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

    // Conversion 2
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const options: { message: string, value: CardType }[] = [
        { message: 'LABEL_FIRE', value: CardType.FIRE },
        { message: 'LABEL_GRASS', value: CardType.GRASS },
        { message: 'LABEL_FIGHTING', value: CardType.FIGHTING },
        { message: 'LABEL_PSYCHIC', value: CardType.PSYCHIC },
        { message: 'LABEL_WATER', value: CardType.WATER },
        { message: 'LABEL_LIGHTNING', value: CardType.LIGHTNING },
        { message: 'LABEL_METAL', value: CardType.METAL },
        { message: 'LABEL_DARK', value: CardType.DARK },
        { message: 'LABEL_DRAGON', value: CardType.DRAGON },
        { message: 'LABEL_FAIRY', value: CardType.FAIRY },
      ];

      return store.prompt(state, new SelectPrompt(
        player.id,
        GameMessage.CHOOSE_SPECIAL_CONDITION,
        options.map(c => c.message),
        { allowCancel: false }
      ), choice => {
        const option = options[choice];

        if (option !== undefined) {
          this.resistance = [{ type: option.value, value: -30 }];
        }
      });
    }

    return state;
  }
}
