import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';
import { AttackEffect, HealEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { CardTarget, PlayerType, SlotType } from '../../../game/store/actions/play-card-action';
import { ChoosePokemonPrompt } from '../../../game/store/prompts/choose-pokemon-prompt';
import { Effect } from '../../../game/store/effects/effect';
import { GameError } from '../../../game/game-error';
import { GameMessage } from '../../../game/game-message';
import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { PokemonCardList } from '../../../game/store/state/pokemon-card-list';
import { PowerType } from '../../../game/store/card/pokemon-types';
import { Stage, CardType, CardTag, SpecialCondition } from '../../../game/store/card/card-types';
import { State } from '../../../game/store/state/state';
import { StoreLike } from '../../../game/store/store-like';

function* useTranquilFlower(next: Function, store: StoreLike, state: State, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;

  const blocked: CardTarget[] = [];
  let hasPokemonWithDamage: boolean = false;
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    if (cardList.damage === 0) {
      blocked.push(target);
    } else {
      hasPokemonWithDamage = true;
    }
  });

  if (hasPokemonWithDamage === false) {
    throw new GameError(GameMessage.CANNOT_USE_POWER);
  }

  let targets: PokemonCardList[] = [];
  yield store.prompt(state, new ChoosePokemonPrompt(
    player.id,
    GameMessage.CHOOSE_POKEMON_TO_HEAL,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    { allowCancel: true, blocked }
  ), results => {
    targets = results || [];
    next();
  });

  if (targets.length === 0) {
    return state;
  }

  targets.forEach(target => {
    // Heal Pokémon
    const healEffect = new HealEffect(player, target, 60);
    store.reduceEffect(state, healEffect);
  });

  return state;
}

export class VenusaurEx extends PokemonCard {

  public id: number = 3;

  public tags: string[] = [CardTag.EX];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Ivysaur';

  public cardType: CardType = CardType.GRASS;

  public hp: number = 340;

  public weakness = [{ type: CardType.FIRE }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers = [{
    name: 'Tranquil Flower',
    useWhenInPlay: true,
    powerType: PowerType.ABILITY,
    text: 'Once during your turn, if this Pokémon is in the Active Spot, you may heal 60 damage from 1 of your Pokémon.'
  }];

  public attacks = [
    {
      name: 'Dangerous Toxwhip',
      cost: [CardType.GRASS, CardType.GRASS, CardType.COLORLESS],
      damage: 150,
      text: 'Your opponent\'s Active Pokémon is now Confused and Poisoned.'
    },
  ];

  public set: string = 'MEW';

  public name: string = 'Venusaur ex';

  public fullName: string = 'Venusaur ex MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Tranquil Flower
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const player = effect.player;

      // Venusaur ex is not Active
      if (player.active.getPokemonCard() !== this) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const generator = useTranquilFlower(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Dangerous Toxwhip
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED, SpecialCondition.POISONED]);
      store.reduceEffect(state, specialConditionEffect);
    }

    return state;
  }
}
