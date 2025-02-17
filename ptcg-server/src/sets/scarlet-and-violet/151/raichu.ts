import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SuperType, EnergyType } from '../../../game/store/card/card-types';
import { StoreLike, State, StateUtils, PlayerType, Power, PowerType, GamePhase, AttachEnergyPrompt, SlotType, PokemonCardList, EnergyCard, CardTarget } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, KnockOutEffect } from '../../../game/store/effects/game-effects';
import { GameMessage } from '../../../game/game-message';
import { DealDamageEffect } from '../../../game/store/effects/attack-effects';

export class Raichu extends PokemonCard {

  public id: number = 26;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Pikachu';

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 120;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Electrical Grounding',
    powerType: PowerType.ABILITY,
    text:
      'When 1 of your Pokémon is Knocked Out by damage from an attack from your opponent\'s Pokémon, ' +
      'you may move a {L} Energy from that Pokémon to this Pokémon.'
  }];

  public attacks = [{
    name: 'Thunder',
    cost: [CardType.LIGHTNING, CardType.LIGHTNING, CardType.COLORLESS],
    damage: 180,
    text: 'This Pokémon also does 50 damage to itself.'
  }];

  public set: string = 'MEW';

  public name: string = 'Raichu';

  public fullName: string = 'Raichu MEW';

  public readonly ELECTRICAL_GROUNDING_MARKER: string = 'ELECTRICAL_GROUNDING_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Electrical Grounding
    if (effect instanceof KnockOutEffect) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      const knockedOutCardList = effect.target;

      // Do not activate between turns, or when it's not opponents turn.
      if (state.phase !== GamePhase.ATTACK || state.players[state.activePlayer] !== opponent) {
        return state;
      }

      const knockedOutPokemonHadLightningEnergyAttached = knockedOutCardList.cards.some(c => {
        return c instanceof EnergyCard && c.name === 'Lightning Energy';
      });

      if (!knockedOutPokemonHadLightningEnergyAttached) {
        return state;
      }

      if (knockedOutCardList.marker.hasMarker(this.ELECTRICAL_GROUNDING_MARKER)) {
        return state;
      }

      let raichuCount = 0;
      const blockedTo: CardTarget[] = [];
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
        if (cardList === effect.target) {
          return;
        }
        if (cardList.cards.includes(this)) {
          raichuCount++;
        } else {
          blockedTo.push(target);
        }
      });

      if (raichuCount === 0) {
        return state;
      }

      // Add marker, do not invoke this effect for other Raichu
      knockedOutCardList.marker.addMarker(this.ELECTRICAL_GROUNDING_MARKER, this);

      // Make copy of the cards in the knocked out card list,
      // because they will be transfered to discard shortly
      const knockedOutCopy = new PokemonCardList();
      knockedOutCopy.cards = knockedOutCardList.cards.slice();

      state = store.prompt(state, new AttachEnergyPrompt(
        player.id,
        GameMessage.ATTACH_ENERGY_CARDS,
        knockedOutCopy,
        PlayerType.BOTTOM_PLAYER,
        [SlotType.ACTIVE, SlotType.BENCH],
        { superType: SuperType.ENERGY, energyType: EnergyType.BASIC, name: 'Lightning Energy' },
        { allowCancel: true, min: 1, max: raichuCount, differentTargets: true, blockedTo }
      ), transfers => {
        transfers = transfers || [];
        knockedOutCardList.marker.removeMarker(this.ELECTRICAL_GROUNDING_MARKER);
        for (const transfer of transfers) {
          const target = StateUtils.getTarget(state, player, transfer.to);
          player.discard.moveCardTo(transfer.card, target);
        }
      });
    }

    // Thunder
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const dealDamage = new DealDamageEffect(effect, 50);
      dealDamage.target = player.active;
      return store.reduceEffect(state, dealDamage);
    }


    return state;
  }

}
