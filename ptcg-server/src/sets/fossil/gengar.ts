import { PokemonCard } from '../../game/store/card/pokemon-card';
import { Stage, CardType } from '../../game/store/card/card-types';
import { StoreLike, State, Power, PowerType, Weakness, Resistance, GameError, GameMessage, DamageMap, MoveDamagePrompt, PlayerType, SlotType, StateUtils, ChoosePokemonPrompt, PokemonCardList } from '../../game';
import { Effect } from '../../game/store/effects/effect';
import { AttackEffect, PowerEffect } from '../../game/store/effects/game-effects';
import { CheckHpEffect } from '../../game/store/effects/check-effects';
import { PutDamageEffect } from '../../game/store/effects/attack-effects';


function* useCurse(next: Function, store: StoreLike, state: State, self: Gengar, effect: PowerEffect): IterableIterator<State> {
  const player = effect.player;
  const opponent = StateUtils.getOpponent(state, player);

  const slot = StateUtils.findCardList(state, effect.card) as PokemonCardList;
  if (slot.marker.hasMarker(self.CURSE_MARKER, self)) {
    throw new GameError(GameMessage.POWER_ALREADY_USED);
  }

  const maxAllowedDamage: DamageMap[] = [];
  opponent.forEachPokemon(PlayerType.TOP_PLAYER, (cardList, card, target) => {
    const checkHpEffect = new CheckHpEffect(opponent, cardList);
    store.reduceEffect(state, checkHpEffect);
    maxAllowedDamage.push({ target, damage: checkHpEffect.hp });
  });

  return store.prompt(state, new MoveDamagePrompt(
    effect.player.id,
    GameMessage.MOVE_DAMAGE,
    PlayerType.TOP_PLAYER,
    [SlotType.ACTIVE, SlotType.BENCH],
    maxAllowedDamage,
    { min: 0, max: 10, allowCancel: true }
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

        slot.marker.addMarker(self.CURSE_MARKER, self);
      }
    }
  });
}

export class Gengar extends PokemonCard {

  public id: number = 5;

  public stage: Stage = Stage.STAGE_2;

  public evolvesFrom: string = 'Haunter';

  public cardType: CardType = CardType.PSYCHIC;

  public hp: number = 80;

  public weakness: Weakness[] = []

  public resistance: Resistance[] = [{ type: CardType.FIGHTING, value: -30 }];

  public retreat = [CardType.COLORLESS];

  public powers: Power[] = [{
    name: 'Curse',
    powerType: PowerType.POKEMON_POWER,
    useWhenInPlay: true,
    text:
      'Once during your turn (before your attack), ' +
      'you may move 1 damage counter from 1 of your opponent\'s Pokémon to another ' +
      '(even if it would Knock Out the other Pokémon). ' +
      'This power can\'t be used if Gengar is Asleep, Confused, or Paralyzed.'
  }];

  public attacks = [{
    name: 'Dark Mind',
    cost: [CardType.PSYCHIC, CardType.PSYCHIC, CardType.PSYCHIC],
    damage: 30,
    text:
      'If your opponent has any Benched Pokémon, ' +
      'choose 1 of them and this attack does 10 damage to it. ' +
      '(Don\'t apply Weakness and Resistance for Benched Pokémon.)'
  }];

  public set: string = 'FO';

  public name: string = 'Gengar';

  public fullName: string = 'Gengar FO';

  public curseUsedTurn: number = 0;

  public readonly CURSE_MARKER = 'CURSE_MARKER';

  public reduceEffect(store: StoreLike, state: State, effect: Effect): State {

    // Curse
    if (effect instanceof PowerEffect && effect.power === this.powers[0]) {
      const generator = useCurse(() => generator.next(), store, state, this, effect);
      return generator.next().value;
    }

    // Dark Mind
    if (effect instanceof AttackEffect && effect.attack === this.attacks[0]) {
      const player = effect.player;
      const opponent = StateUtils.getOpponent(state, player);

      const hasBenched = opponent.bench.some(b => b.cards.length > 0);

      if (!hasBenched) {
        return state;
      }

      return store.prompt(state, new ChoosePokemonPrompt(
        player.id,
        GameMessage.CHOOSE_POKEMON_TO_DAMAGE,
        PlayerType.TOP_PLAYER,
        [SlotType.BENCH],
        { allowCancel: false }
      ), targets => {
        if (!targets || targets.length === 0) {
          return;
        }
        const damageEffect = new PutDamageEffect(effect, 10);
        damageEffect.target = targets[0];
        store.reduceEffect(state, damageEffect);
      });
    }

    return state;
  }
}