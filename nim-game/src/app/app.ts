import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

interface Pile {
  coinsArray: number[];
  key: number;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [
    trigger('coinAnim', [
      // When a coin is removed from DOM
      transition(':leave', [
        animate(
          '600ms ease',
          style({
            transform: 'translateY(50px)',
            opacity: 0,
            height: '0px', // parent collapses
            width: '0px', // parent collapses
            margin: '0px',
          })
        ),
      ]),
    ]),
  ],
})
export class App {
  protected readonly title = signal('nim-game');

  N = 6; // number of piles
  piles: Pile[] = [];
  showInput = -1;

  constructor() {
    this.generatePiles();
  }

  generatePiles() {
    this.piles = Array.from({ length: this.N }, (_, i) => ({
      coinsArray: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, () => 1),
      key: i + 1,
    }));
  }

  makeInputVisible(key: number) {
    this.showInput = key;
  }

  removeCoins(pile: Pile, coinsToRemove: number) {
    if (!coinsToRemove) return;
    coinsToRemove = Math.min(coinsToRemove, pile.coinsArray.length + 1);
    if (coinsToRemove == pile.coinsArray.length + 1) {
      for (let i = 0; i < this.piles.length; i++) {
        if (this.piles[i].key == pile.key) {
          this.piles.splice(i, 1);
          this.showInput = -1;
          return;
        }
      }
    }
    pile.coinsArray.splice(pile.coinsArray.length - coinsToRemove, coinsToRemove);
    this.showInput = -1;
  }
}
