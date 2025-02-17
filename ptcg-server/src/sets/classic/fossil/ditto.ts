import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, Power, PowerType, StateUtils, EnergyCard, Attack, ChooseAttackPrompt, GameLog, GameMessage, GameError } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { CheckHpEffect, CheckPokemonStatsEffect, CheckPokemonTypeEffect, CheckProvidedEnergyEffect } from '../../../game/store/effects/check-effects';
import { PowerEffect, UseAttackEffect } from '../../../game/store/effects/game-effects';


function* useTransform(next: Function, store: StoreLike, state: State,
  effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);
  const pokemonCard = opponent.active.getPokemonCard();

  if (pokemonCard === undefined || pokemonCard.attacks.length === 0) {
    return state;
  }

  let selected: any;
  yield store.prompt(state, new ChooseAttackPrompt(
    player.id,
    GameMessage.CHOOSE_ATTACK_TO_COPY,
    [pokemonCard],
    { allowCancel: false }
  ), result => {
    selected = result;
    next();
  });

  const attack: Attack | null = selected;

  if (attack === null) {
    return state;
  }

  store.log(state, GameLog.LOG_PLAYER_COPIES_ATTACK, {
    name: player.name,
    attack: attack.name
  });

  // Perform attack
  const useAttackEffect = new UseAttackEffect(player, attack, pokemonCard);
  store.reduceEffect(state, useAttackEffect);

  if (store.hasPrompts()) {
    yield store.waitPrompt(state, () => next());
  }

  return state;
}

export class Ditto extends PokemonCard {

  public stage: Stage = Stage.BASIC;

  public cardType: CardType = CardType.COLORLESS;

  public hp: number = 50;

  public weakness = [{ type: CardType.FIGHTING }];

  public resistance = [{ type: CardType.PSYCHIC, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Transform',
    powerType: PowerType.POKEMON_POWER,
    useWhenInPlay: true,
    text:
      ' If Ditto is your Active Pokémon, ' +
      'treat it as if it were the same card as the Defending Pokémon, ' +
      'including type, Hit Points, Weakness, and so on, ' +
      'except Ditto can\'t evolve, always has this Pokémon Power, ' +
      'and you may treat any Energy attached to Ditto as Energy of any type. ' +
      'Ditto isn\'t a copy of any other Pokémon while Ditto is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [];

  public set: string = 'FO';

  public name: string = 'Ditto';

  public fullName: string = 'Ditto FO';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      // Ditto is not Active
      if (effect.player.active.getPokemonCard() !== this) {
        throw new GameError(GameMessage.CANNOT_USE_POWER);
      }

      const generator = useTransform(() => generator.next(), store, state, effect);
      return generator.next().value;
    }

    if (effect instanceof CheckPokemonTypeEffect && effect.target.getPokemonCard() === this) {
      if (effect.target.specialConditions.includes(SpecialCondition.ASLEEP) ||
        effect.target.specialConditions.includes(SpecialCondition.CONFUSED) ||
        effect.target.specialConditions.includes(SpecialCondition.PARALYZED)) {
        return state;
      }

      effect.preventDefault = true;

      const owner = StateUtils.findOwner(state, effect.target);
      const opponent = StateUtils.getOpponent(state, owner);

      if (owner.active.getPokemonCard() === this) {
        effect.cardTypes = [opponent.active.getPokemonCard()?.cardType || this.cardType];
      }
    }

    if (effect instanceof CheckHpEffect && effect.target.getPokemonCard() === this) {
      if (effect.target.specialConditions.includes(SpecialCondition.ASLEEP) ||
        effect.target.specialConditions.includes(SpecialCondition.CONFUSED) ||
        effect.target.specialConditions.includes(SpecialCondition.PARALYZED)) {
        return state;
      }

      effect.preventDefault = true;

      const owner = StateUtils.findOwner(state, effect.target);
      const opponent = StateUtils.getOpponent(state, owner);

      if (owner.active.getPokemonCard() === this) {
        effect.hp = opponent.active.getPokemonCard()?.hp || this.hp;
      }
    }

    if (effect instanceof CheckPokemonStatsEffect && effect.target.getPokemonCard() === this) {
      if (effect.target.specialConditions.includes(SpecialCondition.ASLEEP) ||
        effect.target.specialConditions.includes(SpecialCondition.CONFUSED) ||
        effect.target.specialConditions.includes(SpecialCondition.PARALYZED)) {
        return state;
      }

      effect.preventDefault = true;

      const owner = StateUtils.findOwner(state, effect.target);
      const opponent = StateUtils.getOpponent(state, owner);

      if (owner.active.getPokemonCard() === this) {
        effect.weakness = opponent.active.getPokemonCard()?.weakness || this.weakness;
        effect.resistance = opponent.active.getPokemonCard()?.resistance || this.resistance;
      }
    }

    if (effect instanceof CheckProvidedEnergyEffect && effect.player.active.getPokemonCard() === this) {
      if (effect.player.active.specialConditions.includes(SpecialCondition.ASLEEP) ||
        effect.player.active.specialConditions.includes(SpecialCondition.CONFUSED) ||
        effect.player.active.specialConditions.includes(SpecialCondition.PARALYZED)) {
        return state;
      }

      effect.preventDefault = true;

      effect.source.cards.forEach(c => {
        if (c instanceof EnergyCard && !effect.energyMap.some(e => e.card === c)) {
          effect.energyMap.push({ card: c, provides: c.provides.map(e => CardType.ANY) });
        }
      });
    }

    return state;
  }

}
