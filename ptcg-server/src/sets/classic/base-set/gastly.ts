import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, StateUtils, GameMessage, CoinFlipPrompt, Card, ChooseEnergyPrompt, PlayerType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, KnockOutEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect, DealDamageEffect, DiscardCardsEffect } from '../../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Gastly extends PokemonCard {

  public id: number = 50;

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 30;

  public weakness = [];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public attacks = [
    {
      name: 'Sleeping Gas',
      cost: [CardType.PSYCHIC],
      damage: 0,
      text: 'Flip a coin. If heads, the Defending Pokémon is now Asleep.'
    },
    {
      name: 'Destiny Bond',
      cost: [CardType.PSYCHIC, CardType.COLORLESS],
      damage: 0,
      text:
        'Discard 1 {P} Energy card attached to Gastly in order to use this attack. ' +
        'If a Pokémon Knocks Out Gastly during your opponent\'s next turn, Knock Out that Pokémon.'
    }
  ];

  public set: string = 'BS';

  public name: string = 'Gastly';

  public fullName: string = 'Gastly BS';

  private readonly DESTINY_BOND_MARKER = 'DESTINY_BOND_MARKER';

  private readonly CLEAR_DESTINY_BOND_MARKER = 'CLEAR_DESTINY_BOND_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Sleeping Gas
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

    // Destiny Bond
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      state = store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [CardType.PSYCHIC],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);
        const discardEnergy = new DiscardCardsEffect(effect, cards);
        discardEnergy.target = player.active;
        store.reduceEffect(state, discardEnergy);

        player.active.marker.addMarker(this.DESTINY_BOND_MARKER, this);
        opponent.marker.addMarker(this.CLEAR_DESTINY_BOND_MARKER, this);
      });

      return state;
    }

    if (effect instanceof DealDamageEffect
      && effect.target.cards.includes(this)
      && effect.target.marker.hasMarker(this.DESTINY_BOND_MARKER)) {
      const pokemonCard = effect.target.getPokemonCard();
      const sourceCard = effect.source.getPokemonCard();

      // pokemon is evolved
      if (pokemonCard !== this) {
        return state;
      }

      const willKill = effect.damage + effect.target.damage >= pokemonCard.hp;

      if (sourceCard && willKill) {
        // Try to reduce PowerEffect, to check if something is blocking our ability
        try {
          const killerOwner = StateUtils.findOwner(state, effect.source);
          const destinyBondEffect = new KnockOutEffect(killerOwner, effect.source);
          store.reduceEffect(state, destinyBondEffect);
        } catch {
          return state;
        }
      }
    }

    if (effect instanceof EndTurnEffect
      && effect.player.marker.hasMarker(this.CLEAR_DESTINY_BOND_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_DESTINY_BOND_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.DESTINY_BOND_MARKER, this);
      });
    }

    return state;
  }
}
