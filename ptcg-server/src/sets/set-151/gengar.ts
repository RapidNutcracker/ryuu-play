import { Effect } from '../../game/store/effects/effect';
import { PokemonCard } from '../../game/store/card/pokemon-card';
import { AttackEffect } from '../../game/store/effects/game-effects';
import { Stage, CardType } from '../../game/store/card/card-types';
import {
  StoreLike,
  State,
  Resistance,
  Weakness,
  Attack,
  GameMessage,
  StateUtils,
  ShowCardsPrompt,
  TrainerCard,
  DamageMap,
  PlayerType,
  PutDamagePrompt,
  SlotType
} from '../../game';
import { CheckHpEffect } from '../../game/store/effects/check-effects';

export class Gengar extends PokemonCard {

  public id: number = 94;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Haunter';

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 130;

  public weakness: Weakness[] = [{ type: CardType.DARK }];

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public attacks: Attack[] = [{
    name: 'Poltergeist',
    cost: [CardType.PSYCHIC],
    damage: 0,
    text: 'Your opponent reveals their hand. This attack does 50 damage for each Trainer card you find there.'
  }, {
    name: 'Hollow Dive',
    cost: [CardType.PSYCHIC, CardType.COLORLESS],
    damage: 0,
    text: 'Put 3 damage counters on your opponent\'s Benched Pokémon in any way you like.'
  }];

  public set: string = 'MEW';

  public name: string = 'Gengar';

  public fullName: string = 'Gengar MEW';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Poltergeist
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);
      if (opponent.hand.cards.length === 0) {
        return state;
      }
      return store.prompt(state, new ShowCardsPrompt(
        player.id,
        GameMessage.CARDS_SHOWED_BY_THE_OPPONENT,
        opponent.hand.cards
      ), () => {
        const trainers = opponent.hand.cards.filter(c => c instanceof TrainerCard);
        effect.damage = 50 * trainers.length;
      });
    }

    // Hollow Dive
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = effect.opponent;

      const maxAllowedDamage: DamageMap[] = [];
      let damageLeft = 0;
      opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card, target) => {
        if (target.slot === SlotType.BENCH) {
          const checkHpEffect = new CheckHpEffect(opponent, cardList);
          store.reduceEffect(state, checkHpEffect);

          damageLeft += checkHpEffect.hp - cardList.damage;
          maxAllowedDamage.push({ target, damage: checkHpEffect.hp });
        }
      });

      const damage = Math.min(30, damageLeft);

      return store.prompt(state, new PutDamagePrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        damage,
        maxAllowedDamage,
        { allowCancel: true }
      ), targets => {
        const results = targets || [];

        // cancelled by user
        if (results.length === 0) {
          return;
        }

        for (const result of results) {
          const target = StateUtils.getTarget(state, player, result.target);
          target.damage += result.damage;
        }
      });
    }

    return state;
  }
}
