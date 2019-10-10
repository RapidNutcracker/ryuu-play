import { Card } from "../store/state/card";

export class CardManager {

  private static instance: CardManager;

  private cards: Card[] = [];

  public static getInstance(): CardManager {
    if (!CardManager.instance) {
      CardManager.instance = new CardManager();
    }

    return CardManager.instance;
  }

  public defineSet(cards: Card[]): void {
    this.cards.push(...cards);
  }

  public defineCard(card: Card): void {
    this.cards.push(card);
  }

  public getCardByName(name: string): Card | undefined {
    let card = this.cards.find(c => c.name === name);
    if (card !== undefined) {
      card = {...card};
    }
    return card;
  }

}
