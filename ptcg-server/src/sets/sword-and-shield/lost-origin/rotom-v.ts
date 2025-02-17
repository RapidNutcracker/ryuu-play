import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag, SuperType, TrainerType } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { Power, PowerType } from '../../../game/store/card/pokemon-types';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { EndTurnEffect } from '../../../game/store/effects/game-phase-effects';
import { Card, ChooseCardsPrompt, TrainerCard } from '../../../game';

function* useScrapShort(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;

  const discardedPokemonTools: Card[] = player.discard.cards.filter(card =>
    card instanceof TrainerCard && card.trainerType === TrainerType.TOOL
  );

  if (discardedPokemonTools.length === 0) {
    return state;
  }

  return store.prompt(state, new ChooseCardsPrompt(
    player.id,
    GameMessage.CHOOSE_CARD_TO_LOST_ZONE,
    player.discard,
    { superType: SuperType.TRAINER, trainerType: TrainerType.TOOL },
    { min: 0, max: discardedPokemonTools.length, allowCancel: true }
  ), selected => {
    effect.damage += 40 * selected.length;
    player.discard.moveCardsTo(selected, player.lostZone);
  });
}

export class RotomV extends PokemonCard {

  public id: number = 58;

  public tags: string[] = [CardTag.V];

  public stage: Stage = Stage.BASIC

  public cardTypes: CardType[] = [CardType.LIGHTNING];

  public hp: number = 190;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Instant Charge',
    powerType: PowerType.ABILITY,
    useWhenInPlay: true,
    text:
      'Once during your turn, you may draw 3 cards. If you use this Ability, your turn ends.'
  }];

  public attacks = [{
    name: 'Scrap Short',
    cost: [CardType.LIGHTNING, CardType.LIGHTNING],
    damage: 40,
    text:
      'Put any number of Pokémon Tool cards from your discard pile in the Lost Zone. ' +
      'This attack does 40 more damage for each card you put in the Lost Zone in this way.'
  }];

  public set: string = 'LOR';

  public name: string = 'Rotom V';

  public fullName: string = 'Rotom V LOR';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Instant Charge
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      if (player.deck.cards.length === 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      player.deck.moveTo(player.hand, 3);

      const endTurnEffect = new EndTurnEffect(player);
      store.reduceEffect(state, endTurnEffect);
    }

    // Scrap Short
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useScrapShort(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
