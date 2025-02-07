import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, GameError, GameMessage, PokemonCardList, StateUtils, CardTarget, ChoosePokemonPrompt, PlayerType, SlotType } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect } from '../../game/store/effects/game-effects';

function* useBangBoomChain(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;

  let pokemonsWithTool = 0;
  const blocked: CardTarget[] = [];
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    if (cardList.tool !== undefined) {
      pokemonsWithTool += 1;
    } else {
      blocked.push(target);
    }
  });

  if (pokemonsWithTool === 0) {
    throw new GameError(GameMessage.CANNOT_PLAY_THIS_CARD);
  }

  // We will discard this card after prompt confirmation
  effect.preventDefault = true;

  const max = pokemonsWithTool;
  let targets: PokemonCardList[] = [];
  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_POKEMON_TO_DISCARD_CARDS,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { min: 1, max: max, allowCancel: true, blocked }
  ), results => {
    targets = results || [];
    next();
  });

  if (targets.length === 0) {
    return state;
  }

  targets.forEach(target => {
    const owner = StateUtils.findOwner(state, target);
    if (target.tool !== undefined) {
      target.moveCardTo(target.tool, owner.discard);
      target.tool = undefined;
    }
  });

  return state;
}

export class Electrode extends PokemonCard {

  public id: number = 101;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Voltorb';

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 90;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Bang Boom Chain',
    cost: [CardType.LIGHTNING],
    damage: 20,
    text:
      'Before doing damage, you may discard any number of Pokémon Tools from your Pokémon. ' +
      'This attack does 40 more damage for each card you discarded in this way.'
  }, {
    name: 'Electro Ball',
    cost: [CardType.LIGHTNING, CardType.COLORLESS],
    damage: 70,
    text: ''
  }];

  public set: string = 'MEW';

  public name: string = 'Electrode';

  public fullName: string = 'Electrode MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Bang Boom Chain
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const generator = useBangBoomChain(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }
}
