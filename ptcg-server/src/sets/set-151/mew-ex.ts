import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import {
  PowerType, StoreLike, State, StateUtils, GameError, GameMessage,
  PlayerType, ChooseAttackPrompt,
  Resistance,
  PokemonCardList,
  GameLog
} from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { PowerEffect, AttackEffect, UseAttackEffect } from '../../game/store/effects/game-effects';
import { EndTurnEffect } from '../../game/store/effects/game-phase-effects';

export class MewEx extends PokemonCard {

  public id: number = 151;

  public tags = [CardTag.EX];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 180;

  public weakness = [{ type: CardType.DARKNESS }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public powers = [{
    name: 'Restart',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text: 'Once during your turn, you may draw cards until you have 3 cards in your hand.'
  }];

  public attacks = [{
    name: 'Genome Hacking',
    cost: [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS],
    damage: 0,
    text: 'Choose 1 of your opponent\'s Active Pokémon\'s attacks and use it as this attack.'
  }];

  public set: string = 'MEW';

  public name: string = 'Mew ex';

  public fullName: string = 'Mew ex MEW';

  public readonly RESTART_MARKER = 'RESTART_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Restart
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      const slot = StateUtils.findCardList(state, this) as PokemonCardList;

      if (slot.marker.hasMarker(this.RESTART_MARKER, this)) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const cards = player.hand.cards.filter(c => c !== this);
      const cardsToDraw = Math.max(0, 3 - cards.length);

      if (cardsToDraw === 0 || player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
      }

      slot.marker.addMarker(this.RESTART_MARKER, this);

      player.deck.moveTo(player.hand, cardsToDraw);
    }

    // Genome Hacking, if this doesn't work, reference Zoroark's Foul Play
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const opponentActivePokemon = opponent.active.getPokemonCard();

      if (!opponentActivePokemon || opponentActivePokemon.attacks.length === 0) {
        return state;
      }

      return store.prompt(state, new ChooseAttackPrompt(
        player.id,
        GameMessage.CHOOSE_ATTACK_TO_COPY,
        [opponentActivePokemon],
        { allowCancel: false }
      ), attack => {
        if (attack !== null) {

          store.log(state, GameLog.LOG_PLAYER_COPIES_ATTACK, {
            name: player.name,
            attack: attack.name
          });

          const useAttackEffect = new UseAttackEffect(player, attack, this);
          store.reduceEffect(state, useAttackEffect);
        }
      });
    }

    // Clear Restart Marker
    if (effect instanceof EndTurnEffect) {
      effect.player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        cardList.marker.removeMarker(this.RESTART_MARKER, this);
      });
    }

    return state;
  }
}
