import { AttachEnergyEffect } from '../../game/store/effects/play-card-effects';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { CheckProvidedEnergyEffect } from '../../game/store/effects/check-effects';
import { DiscardCardsEffect } from '../../game/store/effects/attack-effects';
import { Effect } from '../../game/store/effects/effect';
import { GameMessage } from '../../game/game-message';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, EnergyType, SuperType } from '../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Card,
  ChooseEnergyPrompt,
  EnergyCard,
  AttachEnergyPrompt,
  PlayerType,
  SlotType,
  StateUtils
} from '../../game';

export class Arcanine extends PokemonCard {

  public id: number = 59;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Growlithe';

  public cardType: CardType = CardType.FIRE;

  public hp: number = 150;

  public weakness = [{ type: CardType.WATER }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks = [{
    name: 'Torrid Torrent',
    cost: [CardType.FIRE],
    damage: 50,
    text: 'Attach up to 2 Basic {R} Energy cards from your discard pile to this Pokémon.'
  }, {
    name: 'Dynamite Fang',
    cost: [CardType.FIRE, CardType.FIRE, CardType.COLORLESS, CardType.COLORLESS],
    damage: 240,
    text: 'Discard 2 {R} Energy from this Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Arcanine';

  public fullName: string = 'Arcanine MEW';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Torrid Torrent
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const hasFireEnergyInDiscardPile = player.discard.cards.some(c => {
        return c instanceof EnergyCard
          && c.energyType === EnergyType.BASIC
          && c.provides.includes(CardType.FIRE);
      });

      if (!hasFireEnergyInDiscardPile) {
        return state;
      }

      return store.prompt(state, new AttachEnergyPrompt(
        player.id,
        GameMessage.ATTACH_ENERGY_CARDS,
        player.discard,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.ACTIVE],
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, name: 'Fire Energy' },
        { min: 1, max: 2, allowCancel: true }
      ), transfers => {
        transfers = transfers || [];
        for (const transfer of transfers) {
          const target = StateUtils.getTarget(state, player, transfer.to);
          const energyCard = transfer.card as EnergyCard;
          const attachEnergyEffect = new AttachEnergyEffect(player, energyCard, target, player.discard);
          store.reduceEffect(state, attachEnergyEffect);
        }
      });
    }

    // Dynamite Fang
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      return store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [CardType.FIRE, CardType.FIRE],
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
