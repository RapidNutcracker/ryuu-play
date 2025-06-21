import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SuperType, EnergyType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { Power, PowerType } from '../../../game/store/card/pokemon-types';
import { GameMessage } from '../../../game/game-message';
import { Card, ChooseCardsPrompt, ChooseEnergyPrompt, ChoosePokemonPrompt, EnergyCard, GameError, PlayerType, SlotType, StateUtils } from '../../../game';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';
import { AfterDamageEffect, DiscardCardsEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';


export class RadiantGreninja extends PokemonCard {

  public id: number = 46;

  public tags: string[] = [CardTag.RADIANT];

  public stage: Stage = Stage.BASIC

  public cardTypes: CardType[] = [CardType.WATER];

  public hp: number = 130;

  public weakness = [{ type: CardType.LIGHTNING }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Concealed Cards',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'You must discard an Energy card from your hand in order to use this Ability. ' +
      'Once during your turn, you may draw 2 cards.'
  }];

  public attacks = [{
    name: 'Moonlight Shuriken',
    cost: [CardType.WATER, CardType.WATER, CardType.COLORLESS],
    damage: 0,
    text:
      'Discard 2 Energy from this Pokémon. ' +
      'This attack does 90 damage to 2 of your opponent\'s Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'ASR';

  public name: string = 'Radiant Greninja';

  public fullName: string = 'Radiant Greninja ASR';

  public readonly CONCEALED_CARDS_MARKER = 'CONCEALED_CARDS_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Concealed Cards
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.hand.cards.length === 0 || !player.hand.cards.some(card => card instanceof EnergyCard && card.energyType === EnergyType.BASIC)) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      if (player.marker.hasMarker(this.CONCEALED_CARDS_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      state = store.prompt(state, new ChooseCardsPrompt(
        player.id,
        GameMessage.CHOOSE_CARD_TO_DISCARD,
        player.hand,
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC },
        { allowCancel: true, min: 1, max: 1 }
      ), cards => {
        cards = cards || [];
        if (cards.length === 0) {
          return;
        }
        player.marker.addMarker(this.CONCEALED_CARDS_MARKER, this);
        player.hand.moveCardsTo(cards, player.discard);
        player.deck.moveTo(player.hand, 2);
      });

      return state;
    }

    // Moonlight Shuriken
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.ACTIVE, SlotType.BENCH],
        { min: 2, max: 2, allowCancel: false }
      ), targets => {
        targets.forEach(target => {
          if (target === opponent.active) {
            effect.damage = 90;
            store.reduceEffect(state, effect);
          }

          const damageEffect = new PutDamageEffect(effect, 90);
          damageEffect.target = target;
          store.reduceEffect(state, damageEffect);
        });
      });
    }

    // Moonlight Shuriken, Discard Energy
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      return store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [CardType.ANY, CardType.ANY],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);
        const discardEnergy = new DiscardCardsEffect(effect.attackEffect, cards);
        discardEnergy.target = player.active;
        store.reduceEffect(state, discardEnergy);
      });
    }

    if (effect instanceof EndTurnEffect) {
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.CONCEALED_CARDS_MARKER, this)
      });
    }

    return state;
  }

}
