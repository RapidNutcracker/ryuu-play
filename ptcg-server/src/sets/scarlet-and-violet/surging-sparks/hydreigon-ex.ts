import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { AttackEffect } from '../../../game/store/effects/game-effects';
import { Attack } from '../../../game/store/card/pokemon-types';
import { StateUtils } from '../../../game/store/state-utils';
import { PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { ChoosePokemonPrompt } from '../../../game/store/prompts/choose-pokemon-prompt';
import { GameMessage } from '../../../game/game-message';
import { PlayerType, SlotType } from '../../../game/store/actions/play-card-action';

export class HydreigonEx extends PokemonCard {

  public id: number = 119;

  public tags: string[] = [CardTag.EX, CardTag.TERA];

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Zweilous';

  public cardTypes: CardType[] = [CardType.DARKNESS];

  public hp: number = 330;

  public weakness = [{ type: CardType.GRASS }];

  public retreat = [CardType.COLORLESS, CardType.COLORLESS, CardType.COLORLESS];

  public attacks: Attack[] = [{
    name: 'Crashing Headbutt',
    cost: [CardType.DARKNESS, CardType.COLORLESS],
    damage: 200,
    text: 'Discard the top 3 cards of your opponent\'s deck.'
  }, {
    name: 'Obsidian',
    cost: [CardType.PSYCHIC, CardType.DARKNESS, CardType.METAL, CardType.COLORLESS],
    damage: 130,
    text:
      'This attack also does 130 damage to 2 of your opponent\'s Benched Pokémon. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'SSP';

  public name: string = 'Hydreigon ex';

  public fullName: string = 'Hydreigon ex SSP';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Crashing Headbutt
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const opponent = effect.opponent;
      opponent.deck.moveTo(opponent.discard, 3);
      return state;
    }

    // Obsidian
    if (effect instanceof AttackEffect && effect.attack === this.attacks[1]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const benched = opponent.bench.reduce((left, b) => left + (b.cards.length ? 1 : 0), 0);
      if (benched === 0) {
        return state;
      }
      const count = Math.min(2, benched);

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { min: count, max: count, allowCancel: false }
      ), targets => {
        if (!targets || targets.length === 0) {
          return;
        }
        targets.forEach(target => {
          const damageEffect = new PutDamageEffect(effect, 130);
          damageEffect.target = target;
          store.reduceEffect(state, damageEffect);
        });
      });
    }

    return state;
  }
}
