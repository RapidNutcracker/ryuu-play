import { PokemonCard } from '../../../game/store/card/pokemon-card';
import { Stage, CardType, SpecialCondition } from '../../../game/store/card/card-types';
import { StoreLike, State, PowerType, GameMessage, CoinFlipPrompt, Power, SelectPrompt, GameError, StateUtils, PlayerType } from '../../../game';
import { Effect } from '../../../game/store/effects/effect';
import { AddSpecialConditionsEffect, AfterDamageEffect } from '../../../game/store/effects/attack-effects';
import { PowerEffect } from '../../../game/store/effects/game-effects';
import { CheckPokemonTypeEffect } from '../../../game/store/effects/check-effects';

export class Venomoth extends PokemonCard {

  public id: number = 13;

  public stage: Stage = Stage.STAGE_1;

  public evolvesFrom: string = 'Venonat';

  public cardTypes: CardType[] = [CardType.GRASS];

  public hp: number = 70;

  public weakness = [{ type: CardType.FIRE }];

  public resistance = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [];

  public powers: Power[] = [{
    name: 'Shift',
    powerType: PowerType.POKEMON_POWER,
    useWhenInPlay: true,
    text:
      'Once during your turn (before your attack), ' +
      'you may change the type of Venomoth to the type of any other Pokémon in play other than Colorless. ' +
      'This power can’t be used if Venomoth is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [{
    name: 'Venom Powder',
    cost: [CardType.GRASS, CardType.GRASS],
    damage: 10,
    text: 'Flip a coin. If heads, the Defending Pokémon is now Confused and Poisoned.'
  }];

  public set: string = 'JU';

  public name: string = 'Venomoth';

  public fullName: string = 'Venomoth JU';


  private shiftUsedTurn: number = 0;

  private SHIFTED_TYPE: CardType[] = [CardType.NONE];


  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Shift
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {

      if (this.shiftUsedTurn === state.turn) {
        throw new GameError(GameMessage.POWER_ALREADY_USED);
      }

      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      let typeMap: { [key: number]: boolean } = {};
      player.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        if (cardList.cards.length > 0) {
          const pokemonCard = cardList.getPokemonCard();
          if (pokemonCard !== undefined && !pokemonCard.cardTypes.includes(CardType.COLORLESS)) {
            pokemonCard.cardTypes.forEach(cardType => {
              typeMap[cardType] = true;
            });
          }
        }
      });

      opponent.forEachPokemon(PlayerType.BOTTOM_PLAYER, (cardList) => {
        if (cardList.cards.length > 0) {
          const pokemonCard = cardList.getPokemonCard();
          if (pokemonCard !== undefined && !pokemonCard.cardTypes.includes(CardType.COLORLESS)) {
            pokemonCard.cardTypes.forEach(cardType => {
              typeMap[cardType] = true;
            });
          }
        }
      });

      const options: { message: string, value: CardType }[] =
        Object.keys(typeMap).map(key =>
          ({ message: `LABEL_${Object.keys(CardType)[+key]}`, value: +key as CardType })
        );

      return store.prompt(state, new SelectPrompt(
        player.id,
        GameMessage.CHOOSE_NEW_TYPE,
        options.map(c => c.message),
        { allowCancel: false }
      ), choice => {
        const selected = options[choice];

        this.shiftUsedTurn = state.turn;
        this.SHIFTED_TYPE = [selected.value];
      });
    }

    // Shift is active
    if (effect instanceof CheckPokemonTypeEffect && effect.target.getPokemonCard() === this && this.shiftUsedTurn > 0) {
      effect.cardTypes = this.SHIFTED_TYPE;
      return state;
    }

    // Venom Powder
    if (effect instanceof AfterDamageEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;

      return store.prompt(state, [
        new CoinFlipPrompt(player.id, GameMessage.COIN_FLIP)
      ], result => {
        if (result === true) {
          const specialConditionEffect = new AddSpecialConditionsEffect(
            effect.attackEffect,
            [SpecialCondition.CONFUSED, SpecialCondition.POISONED]
          );
          store.reduceEffect(state, specialConditionEffect);
        }
      });
    }

    return state;
  }
}
