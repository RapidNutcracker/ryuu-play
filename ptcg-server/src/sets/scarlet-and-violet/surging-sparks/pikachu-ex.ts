import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, CardTag } from '../../../game/store/card/card-types';
import { StoreLike } from '../../../game/store/store-like';
import { GamePhase, State } from '../../../game/store/state/state';
import { Effect } from '../../../game/store/effects/effect';
import { PowerEffect } from '../../../game/store/effects/game-effects';
import { Attack, Power, PowerType } from '../../../game/store/card/pokemon-types';
import { StateUtils } from '../../../game/store/state-utils';
import { GameMessage } from '../../../game/game-message';
import { Card, ChooseEnergyPrompt } from '../../../game';
import { AfterDamageEffect, DiscardCardsEffect, PutDamageEffect } from '../../../game/store/effects/attack-effects';
import { CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';

export class PikachuEx extends PokemonCard {

  public id: number = 57;

  public tags: string[] = [CardTag.EX, CardTag.TERA];

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.LIGHTNING;

  public hp: number = 200;

  public weakness = [{ type: CardType.FIGHTING }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Resolute Heart',
    powerType: PowerType.ABILITY,
    text:
      'If this Pokémon has full HP and would be Knocked Out by damage from an attack, ' +
      'it is not Knocked Out, and its remaining HP becomes 10.'
  }];

  public attacks: Attack[] = [{
    name: 'Topaz Bolt',
    cost: [CardType.GRASS, CardType.LIGHTNING, CardType.METAL],
    damage: 300,
    text: 'Discard 3 Energy from this Pokémon.'
  }];

  public set: string = 'SSP';

  public name: string = 'Pikachu ex';

  public fullName: string = 'Pikachu ex SSP';


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {
    // Resolute Heart
    if (effect instanceof PutDamageEffect && effect.target.getPokemonCard() === this) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      if (state.phase !== GamePhase.ATTACK) {
        return state;
      }

      if (effect.target.damage === 0 && effect.damage >= 200) {

        try {
          const powerEffect = new PowerEffect(opponent, this.powers[0], this);
          state = store.reduceEffect(state, powerEffect);
        } catch {
          return state;
        }

        effect.damage = 190;
      }
    }

    // Topaz Bolt
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      const checkProvidedEnergy = new CheckProvidedEnergyEffect(player);
      state = store.reduceEffect(state, checkProvidedEnergy);

      return store.prompt(state, new ChooseEnergyPrompt(
        player.id,
        GameMessage.CHOOSE_ENERGIES_TO_DISCARD,
        checkProvidedEnergy.energyMap,
        [CardType.ANY, CardType.ANY, CardType.ANY],
        { allowCancel: false }
      ), energy => {
        const cards: Card[] = (energy || []).map(e => e.card);

        const discardEnergy = new DiscardCardsEffect(effect.attackEffect, cards);
        discardEnergy.target = player.active;

        state = store.reduceEffect(state, discardEnergy);
      });
    }

    return state;
  }

}
