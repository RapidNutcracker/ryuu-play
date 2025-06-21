import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { PowerType, StoreLike, State, GameError, GameMessage, PlayerType, PokemonCardList, SlotType, CoinFlipPrompt, DamageMap, MoveDamagePrompt, StateUtils, CardTarget } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../../game/store/effects/game-effects';
import { AddSpecialConditionsEffect } from '../../../game/store/effects/attack-effects';
import { CheckHpEffect } from '../../../game/store/effects/check-effects';


function* useStrangeBehavior(next: Function, store: StoreLike, state: State, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;

  const blockedTo: CardTarget[] = [];
  const maxAllowedDamage: DamageMap[] = [];

  player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList, card, target) => {
    if (cardList.getPokemonCard() === effect.card) {
      const checkHpEffect = new CheckHpEffect(player, cardList);
      store.reduceEffect(state, checkHpEffect);
      maxAllowedDamage.push({ target, damage: checkHpEffect.hp - 10 });
    } else {
      blockedTo.push(target);
    }
  });

  return store.prompt(state, new MoveDamagePrompt(
    player.id,
    GameMessage.MOVE_DAMAGE,
    PlayerType.BOTTOM_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    maxAllowedDamage,
    { allowCancel: true, blockedTo }
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

export class Slowbro extends PokemonCard {

  public id: number = 43;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom = 'Slowpoke';

  public cardTypes: CardType[] = [CardType.PSYCHIC];

  public hp: number = 60;

  public weakness = [{ type: CardType.PSYCHIC }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public powers = [{
    name: 'Strange Behavior',
    useWhenInPlay: true,
    powerType: PowerType.POKEMON_POWER,
    text:
      'As often as you like during your turn (before your attack), ' +
      'you may move 1 damage counter from 1 of your Pokémon to Slowbro ' +
      'as long as you don\'t Knock Out Slowbro. ' +
      'This power can\'t be used if Slowbro is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [{
    name: 'Psyshock',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC],
    damage: 20,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Paralyzed.'
  }];

  public set: string = 'FO';

  public name: string = 'Slowbro';

  public fullName: string = 'Slowbro FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Strange Behavior
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const cardList = StateUtils.findCardList(state, this) as PokemonCardList;

      if (cardList.specialConditions.length > 0) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const generator = useStrangeBehavior(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    // Psyshock
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(effect, [SpecialCondition.PARALYZED]);
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }
}
