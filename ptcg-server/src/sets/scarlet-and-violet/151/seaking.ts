import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../../game/store/card/card-types';
import { StoreLike, State, Resistance, Weakness, Attack, CoinFlipPrompt, GameMessage, GamePhase, PlayerType, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';
import { AbstractAttackEffect } from '../../../game/store/effects/attack-effects';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';

export class Seaking extends PokemonCard {

  public id: number = 119;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Goldeen';

  public cardType: CardType = CardType.WATER;

  public hp: number = 110;

  public weakness: Weakness[] = [{ type: CardType.LIGHTNING }];

  public resistance: Resistance[] = [];

  public retreat: CardType[] = [CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Swim Freely',
    cost: [CardType.WATER],
    damage: 0,
    text:
      'Flip a coin. If heads, during your opponent\'s next turn, ' +
      'prevent all damage from and effects of attacks done to this Pokémon.'
  }, {
    name: 'Aqua Horn',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 60,
    text: 'This attack does 30 more damage for each {W} Energy attached to this Pokémon.'
  }];

  public set: string = 'MEW';

  public name: string = 'Seaking';

  public fullName: string = 'Seaking MEW';

  public readonly SWIM_FREELY_MARKER: string = 'SWIM_FREELY_MARKER';

  public readonly CLEAR_SWIM_FREELY_MARKER: string = 'CLEAR_SWIM_FREELY_MARKER';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Swim Freely 
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      return store.prompt(
        state,
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP),
        result => {
          if (result === true) {
            player.active.marker.addMarker(this.SWIM_FREELY_MARKER, this);
            opponent.marker.addMarker(this.CLEAR_SWIM_FREELY_MARKER, this);
          }
        });
    }

    // Swim Freely is active
    if (effect instanceof AbstractAttackEffect && effect.target.cards.includes(this)) {
      const pokemonCard = effect.target.getPokemonCard();
      const sourceCard = effect.source.getPokemonCard();

      // Card is not active, or damage source is unknown
      if (pokemonCard !== this || sourceCard === undefined) {
        return state;
      }

      // Do not ignore self-damage
      const player = StateUtils.findOwner(state, effect.target);
      const opponent = StateUtils.findOwner(state, effect.source);
      if (player === opponent) {
        return state;
      }

      // It's not an attack
      if (state.phase !== GamePhase.ATTACK) {
        return state;
      }

      effect.preventDefault = true;
    }

    // Clear Swim Freely
    if (effect instanceof EndTurnEffect && effect.player.marker.hasMarker(this.CLEAR_SWIM_FREELY_MARKER, this)) {

      effect.player.marker.removeMarker(this.CLEAR_SWIM_FREELY_MARKER, this);

      const opponent = StateUtils.getOpponent(state, effect.player);
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.SWIM_FREELY_MARKER, this);
      });
    }

    // Aqua Horn
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const checkProvidedEnergyEffect = new CheckProvidedEnergyEffect(player);
      store.reduceEffect(state, checkProvidedEnergyEffect);

      let energyCount = 0;
      checkProvidedEnergyEffect.energyMap.forEach(em => {
        energyCount += em.provides.filter(cardType => {
          return cardType === CardType.WATER || cardType === CardType.ANY;
        }).length;
      });

      effect.damage += energyCount * 30;
    }
    return state;
  }

}
