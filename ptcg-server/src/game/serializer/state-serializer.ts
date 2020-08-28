import { GameError, GameMessage } from "../game-error";
import { Serializer, SerializerContext, SerializedState, Serialized } from "./serializer.interface";
import { State } from "../store/state/state";
import { Card } from "../store/card/card";
import { GenericSerializer } from "./generic.serializer";
import { Rules } from "../store/state/rules";
import { Player } from "../store/state/player";
import { CardSerializer } from "./card.serializer";
import { CardListSerializer } from "./card-list.serializer";
import { Marker } from "../store/state/card-marker";
import { StateLogSerializer } from "./state-log.serializer";

export class StateSerializer {

  public serializers: Serializer<any>[];
  public knownCards: Card[] = [];

  constructor() {
    this.serializers = [
      new GenericSerializer(State),
      new GenericSerializer(Rules),
      new GenericSerializer(Player),
      new GenericSerializer(Marker),
      new CardSerializer(),
      new CardListSerializer(),
      new StateLogSerializer()
    ];
  }

  public serialize(state: State): SerializedState {
    const serializers = this.serializers;
    const context = this.createContext(state);

    const replacer: any = function(key: string, value: any) {
      if (value instanceof Array) {
        return value.map(item => replacer('', item));
      }
      if (value instanceof Object) {
        const name = value.constructor.name;
        if (name === 'Object') {
          return value;
        }
        let serializer = serializers.find(s => s.types.includes(name));
        if (value instanceof Card && serializer === undefined) {
          serializer = serializers.find(s => s.types.includes('Card'));
        }
        if (serializer !== undefined) {
          return serializer.serialize(value, context);
        }
        throw new GameError(GameMessage.SERIALIZER_ERROR, `Unknown serializer for '${name}'.`);
      }
      return value;
    };
    const data = JSON.stringify(state, replacer);
    const contextData = { ...context, cards: context.cards.map(card => card.fullName) };
    return JSON.stringify({ data, contextData });
  }

  public deserialize(serializedState: SerializedState): State {
    const serializers = this.serializers;
    const { data, contextData } = JSON.parse(serializedState);
    const context = this.restoreContext(contextData);

    const reviver: any = function (key: string, value: any) {
      if (value instanceof Array) {
        return value.map(item => reviver('', item));
      }
      if (value instanceof Object) {
        const name = (value as Serialized)._type;
        if (typeof name === 'string') {
          const serializer = serializers.find(s => s.types.includes(name));
          if (serializer !== undefined) {
            return serializer.deserialize(value, context);
          }
          throw new GameError(GameMessage.SERIALIZER_ERROR, `Unknown deserializer for '${name}'.`);
        }
      }
      return value;
    };
    return JSON.parse(data, reviver);
  }

  public serializeDiff(base: State, state: State): SerializedState {
    return '';
  }

  public deserializeDiff(base: State, data: SerializedState): State {
    return base;
  }

  public setKnownCards(cards: Card[]) {
    this.knownCards = cards;
  }

  private restoreContext(contextData: any): SerializerContext {
    const names: string[] = contextData.cards;
    const cards: Card[] = [];
    names.forEach(name => {
      const card = this.knownCards.find(c => c.fullName === name);
      if (card === undefined) {
        throw new GameError(GameMessage.SERIALIZER_ERROR, `Unknown card '${name}'.`);
      }
      cards.push(card);
    });
    return { ...contextData, cards };
  }

  private createContext(state: State): SerializerContext {
    const cards: Card[] = [];
    for (let player of state.players) {
      player.stadium.cards.forEach(c => cards.push(c));
      player.active.cards.forEach(c => cards.push(c));
      for (let bench of player.bench) {
        bench.cards.forEach(c => cards.push(c));
      }
      for (let prize of player.prizes) {
        prize.cards.forEach(c => cards.push(c));
      }
      player.hand.cards.forEach(c => cards.push(c));
      player.deck.cards.forEach(c => cards.push(c));
      player.discard.cards.forEach(c => cards.push(c));
    }
    return { cards };
  }

}
