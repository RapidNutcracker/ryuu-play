import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameError, GameMessage, PlayerType, PokemonCardList, SlotType, CoinFlipPrompt, DamageMap, MoveDamagePrompt, StateUtils } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';
import { CheckHpEffect } from '../../../game/store/effects/check-effects';


function* useDamageSwap(next: Function, store: StoreLike, state: State, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;

  const maxAllowedDamage: DamageMap[] = [];
  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    const checkHpEffect = new CheckHpEffect(player, cardList);
    store.reduceEffect(state, checkHpEffect);
    maxAllowedDamage.push({ target, damage: checkHpEffect.hp - 10 });
  });

  return store.prompt(state, new MoveDamagePrompt(
    effect.player.id,
    GameMessage.MOVE_DAMAGE,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    maxAllowedDamage,
    { allowCancel: true }
  ), transfers => {
    if (transfers === null) {
      return;
    }

    for (const transfer of transfers) {
      const source = StateUtils.getTarget(state, player, transfer.from);
      const target = StateUtils.getTarget(state, player, transfer.to);
      if (source.damage >= 10) {
        source.damage -= 10;
        target.damage += 10;
      }
    }
  });
}

export class Alakazam extends PokemonCard {

  public id: number = 1;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom = 'Kadabra';

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 80;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers = [{
    name: 'Damage Swap',
    useWhenInPlay: true,
    powerType: PowerType.POKEMON_POWER,
    text:
      'As often as you like during your turn (before your attack), ' +
      'you may move 1 damage counter from 1 of your Pokémon to another ' +
      'as long as you don\'t Knock Out that Pokémon. ' +
      'This power can\'t be used if Alakazam is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [{
    name: 'Confuse Ray',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.PSYCHIC],
    damage: 30,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Confused.'
  }];

  public set: string = 'BS';

  public name: string = 'Alakazam';

  public fullName: string = 'Alakazam BS';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Damage Swap
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const cardList = StateUtils.findCardList(state, this) as PokemonCardList;

      if (cardList.specialConditions.length > 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const generator = useDamageSwap(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Confuse Ray
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.CONFUSED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }
}
