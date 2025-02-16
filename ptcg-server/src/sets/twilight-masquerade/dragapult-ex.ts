import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../game/store/card/card-types';
import { StoreLike, State, StateUtils, DamageMap, PlayerType, PutDamagePrompt, GameMessage, SlotType } from '../../game';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Effect } from '../../game/store/effects/effect';
import { CheckHpEffect } from '../../game/store/effects/check-effects';
import { PutCountersEffect } from '../../game/store/effects/attack-effects';

function* usePhantomDive(next: Function, store: StoreLike, state: State, effect: AttackEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const maxAllowedDamage: DamageMap[] = [];
  let damageLeft = 0;
  opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card, target) => {
    const checkHpEffect = new CheckHpEffect(opponent, cardList);
    store.reduceEffect(state, checkHpEffect);
    damageLeft += checkHpEffect.hp - cardList.damage;
    maxAllowedDamage.push({ target, damage: checkHpEffect.hp });
  });

  const damage = Math.min(60, damageLeft);

  return store.prompt(state, new PutDamagePrompt(
    effect.player.id,
    GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
    PlayerType.TOP_PLAYER,
    [SlotType.BENCH],
    damage,
    maxAllowedDamage,
    { allowCancel: false }
  ), targets => {
    const results = targets || [];
    for (const result of results) {
      const target = StateUtils.getTarget(state, player, result.target);
      const putCountersEffect = new PutCountersEffect(effect, result.damage);
      putCountersEffect.target = target;
      store.reduceEffect(state, putCountersEffect);
    }
  });
}

export class DragapultEx extends PokemonCard {

  public id: number = 130;

  public stage: Stage = Stage.STAGE_2;

  public tags: string[] = [CardTag.SMALL_EX, CardTag.TERA];

  public evolvesFrom: string = 'Drakloak';

  public cardType: CardType = CardType.DRAGON;

  public hp: number = 320;

  public weakness = [];

  public resistance = [];

  public retreat = [CardType.COLORLESS];

  public attacks = [{
    name: 'Jet Headbutt',
    cost: [CardType.COLORLESS],
    damage: 70,
    text: ''
  }, {
    name: 'Phantom Dive',
    cost: [CardType.FIRE, CardType.PSYCHIC],
    damage: 200,
    text: 'Put 6 damage counters on your opponent\'s Benched Pokémon in any way you like.'
  }];

  public set: string = 'TWM';

  public name: string = 'Dragapult ex';

  public fullName: string = 'Dragapult ex TWM';

  public rules: string[] = [
    'When your Pokémon ex is Knocked Out, your opponent takes 2 Prize cards.',
    'As long as this Pokémon is on your Bench, prevent all damage done to this Pokémon by attacks (both yours and your opponent\'s).'
  ];

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Phantom Dive
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const generator = usePhantomDive(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    return state;
  }

}
