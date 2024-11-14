import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Card, ChooseEnergyPrompt, ChoosePokemonPrompt, PlayerType, SlotType, StateUtils } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { GameMessage } from '../../game/game-message';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';

export class Ninetales extends PokemonCard {

  public id: number = 12;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Vulpix';

  public cardType: CardType = CardType.FIRE;

  public hp: number = 80;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS];

  public attacks = [
    {
      name: 'Lure',
      cost: [CardType.COLORLESS, CardType.COLORLESS],
      damage: 0,
      text: 'If your opponent has any Benched Pokémon, choose 1 of them and switch it with his or her Active Pokémon.'
    },
    {
      name: 'Fire Blast',
      cost: [CardType.FIRE, CardType.FIRE, CardType.FIRE, CardType.FIRE],
      damage: 80,
      text: 'Discard 1 {R} Energy card attached to Ninetales in order to use this attack.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Ninetales';

  public fullName: string = 'Ninetales BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Lure
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const opponentHasBench = opponent.bench.some(b => b.cards.length > 0);

      if (!opponentHasBench) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_SWITCH,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false }
      ), result => {
        const cardList = result[0];
        opponent.switchPokemon(cardList);
      });
    }

    // Fire Blast
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      state = store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [CardType.FIRE],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);
        const discardEnergy = new DiscardCardsEffect(effect, cards);
        discardEnergy.target = player.active;
        store.reduceEffect(state, discardEnergy);
      });
    }

    return state;
  }

}
