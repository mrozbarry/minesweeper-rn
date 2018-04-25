import React from 'react';
import { StyleSheet, TouchableHighlight, Text, View } from 'react-native';
import { create, reveal, cellState, toRows } from './minesweeper';

const GAME_CONFIG = { width: 10, height: 10, mines: 20 };

export default class App extends React.Component {
  state = {
    game: create(GAME_CONFIG),
  };

  newGame = () => {
    this.setState({
      game: create(GAME_CONFIG),
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight
          style={styles.newGame}
          onPress={this.newGame}
        >
          <Text>New Game</Text>
        </TouchableHighlight>
        {this.renderGame()}
      </View>
    );
  }

  revealCell(game, { x, y }) {
    this.setState({
      game: reveal(game, { x, y }),
    })
  }

  renderGame() {
    const { game } = this.state;
    if (!game) return null;

    const matrix = toRows(game);

    return (
      <View style={styles.game}>
        {matrix.map((row, y) => (
          <View key={y} style={styles.row}>
            {row.map((cell, x) => {
              if (cell.state === cellState.hidden) {
                return (
                  <TouchableHighlight
                    key={['empty', x].join('')}
                    style={styles.cell}
                    onPress={() => this.revealCell(game, { x, y })}
                  >
                    <Text></Text>
                  </TouchableHighlight>
                );
              }

              const cellStyle = cell.isMine ? styles.mine : styles.safe;

              return (
                <View key={x} style={[styles.cell, cellStyle, styles.picked]}>
                  <Text style={styles.cellContent}>{cell.isMine ? '*' : cell.touchCount > 0 ? cell.touchCount : ''}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    )
  }
}

const cellSize = 30;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 36,
  },
  newGame: {
    padding: 16,
  },
  game: {
    backgroundColor: 'hsl(0, 0%, 90%)',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  row: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderTopColor: 'hsl(0, 0%, 100%)',
    borderLeftColor: 'hsl(0, 0%, 100%)',
    borderRightColor: 'hsl(0, 0%, 50%)',
    borderBottomColor: 'hsl(0, 0%, 50%)',
    borderWidth: 4,
    borderStyle: 'solid',
    alignItems: 'center',
    justifyContent: 'center',
  },
  picked: {
    borderWidth: 1,
    borderColor: 'hsl(0, 0%, 50%)',
  },
  mine: {
    backgroundColor: 'hsl(10, 99%, 60%)',
  },
  safe: {
  },
  cellContent: {
    fontSize: 16,
  },
});
