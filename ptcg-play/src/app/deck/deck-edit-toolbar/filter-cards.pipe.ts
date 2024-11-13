import { Pipe, PipeTransform } from '@angular/core';

import { DeckEditToolbarFilter } from './deck-edit-toolbar-filter.interface';
import { Card, CardType, SuperType, PokemonCard, EnergyCard } from 'ptcg-server';
import { LibraryItem } from '../deck-card/deck-card.interface';

@Pipe({
  name: 'filterCards'
})
export class FilterCardsPipe implements PipeTransform {

  transform(items: LibraryItem[], filter: DeckEditToolbarFilter): any {

    if (filter === undefined) {
      return items;
    }

    if (filter.searchValue === ''
      && filter.superTypes.length === 0
      && filter.cardTypes.length === 0
      && filter.sets.length === 0) {
      return items;
    }

    return items.filter(item => {
      const card = item.card;
      if (filter.searchValue !== '' && !card.name.match(new RegExp(filter.searchValue, 'ig'))) {
        return false;
      }

      if (filter.superTypes.length && !filter.superTypes.includes(card.superType)) {
        return false;
      }

      if (filter.cardTypes.length && !filter.cardTypes.includes(this.getCardType(card))) {
        return false;
      }

      if (filter.sets.length && !filter.sets.includes(card.set)) {
        return false;
      }

      return true;
    });
  }

  private getCardType(card: Card): CardType {
    if (card.superType === SuperType.POKEMON) {
      return (card as PokemonCard).cardType;
    }
    if (card.superType === SuperType.ENERGY) {
      const energyCard = card as EnergyCard;
      if (energyCard.provides.length > 0) {
        return energyCard.provides[0];
      }
    }
    return CardType.NONE;
  }

}
