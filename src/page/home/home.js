import React from 'react';
import { Container, Box, Field, Header } from './component';
import { size } from '../../shared/config';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      size,
      bombsTotal: 10,
      bombsLoc: [],
      remainingMines: undefined,
      plantField: [],
      loading: true,
      boomed: false,
    }
  }

  componentDidMount = () => {
    const history = this.loadGameProgress();
    if (history) {
      this.setState({...JSON.parse(history)});
    } else {
       this.startGame();
    }
  }

  startGame = () => {
    this.eraseGameProgress();
    this.setRemainingBox(true);
    this.formPlantField();
  }

  setRemainingBox = (first) => {
    if (first) {
      const { size, bombsTotal } = this.state;
      this.setState({ remainingMines: size ** 2 - bombsTotal, boomed: false }); 
    } else {
      const { remainingMines } = this.state;
      this.setState({ remainingMines: remainingMines - 1})
    }
  }

  formPlantField = () => {
    const { size } = this.state;
    const plantField = [...Array(size)].map(() => {
      const f = [...Array(size)].map(() => ({ isMine: false, value: 0, isRevealed: false, isBoom: false }))
      return f;
    })
    this.setState({ plantField }, () => {
      this.plantBombs();
    })
  }

  plantBombs = () => {
    const { bombsTotal, size, plantField } = this.state;
    let total = bombsTotal;
    let locs = [];
    while (total > 0) {
      const [locX, locY] =  [this.getRandomPlant(size), this.getRandomPlant(size)];
      const plant = plantField[locX][locY];
      if (plant.isBoom) {
        continue
      }
      plant.isBoom = true;
      locs.push(`${locX},${locY}`)
      total -= 1;
    }
    this.setState({ plantField, bombsLoc: locs }, () => {
      this.plantMines();
    })
  }

  plantMines = () => {
    const { bombsLoc, plantField } = this.state;
    const newPlantField = plantField.map((a, aI) => (
      a.map((f, fI) => {
        if (f.isBoom) {
          return f
        } else {
          const surroundings = this.getSurroundingCoords(aI, fI);
          const surroundingsResult = this.checkSurroundings(bombsLoc, surroundings);
          return { ...f, value: surroundingsResult }
        }
      })
    ))
    this.setState({ plantField: newPlantField, loading: false });
  }

  mine = (x, y) => {
    const { boomed, plantField, remainingMines } = this.state;
    const box = plantField[x][y];
    if (boomed || remainingMines === 0) {
      alert('Restart Game');
      this.startGame();
      return;
    }

    if (!box.isRevealed) {
      box.isRevealed = true;
      const isBomb = this.checkIsBomb(x, y);
      if (isBomb) {
        this.setState({ boomed: true, plantField }, () => {
          this.eraseGameProgress();
        })
      } else {
        if (box.value === 0) {
          const plant = this.revealZero(x, y, plantField);
          this.setState({ plantField: plant })
        } else {
          this.setState({ plantField }, () => {
            this.setRemainingBox();
          });
        }
      }
      this.storeGameProgress();
    }
  }

  checkIsBomb = (x, y) => {
    const { bombsLoc } = this.state;
    return bombsLoc.indexOf(`${x},${y}`) >= 0;
  }

  // FIXME
  revealZero = (x, y, plantField) => {
    const { size } = this.state;
    let refX = x;
    while (refX < size) {
      const px = plantField[refX];
      if (refX === x) {
        for (let i = y + 1; i < size; i++) {
          const pxy = px[i];
          if (pxy.value === 0) {
            plantField[refX][i].isRevealed = true
          } else {
            refX = size
            break;
          }
        }
      } else {
        for (let i = 0; i < size; i++) {
          const pxy = px[i]
          if (pxy.value === 0) {
            plantField[refX][i].isRevealed = true
          } else {
            refX = size
            break;
          }
        }
      }
      refX += 1
    }
    return plantField;
  }

  getRandomPlant = (size) => Math.floor(Math.random() * size)

  getSurroundingCoords = (x, y) => {
    const { size } = this.state;
    return [[x-1, y], [x+1,y], [x, y-1], [x, y+1]]
            .filter(([x,y]) => (
              (x < size && x >= 0) && (y < size && y >= 0)
            ))
            .map(([x,y]) => `${x},${y}`);
  }

  checkSurroundings = (bombsLoc, s) => s.filter(x => bombsLoc.indexOf(x) >= 0).length;

  storeGameProgress = () => {
    localStorage.setItem('gameProgress', JSON.stringify(this.state));
  }

  loadGameProgress = () => {
    return localStorage.getItem('gameProgress');
  }

  eraseGameProgress = () => {
    localStorage.removeItem('gameProgress')
  }

  render() {
    const { plantField, loading, boomed, remainingMines } = this.state;
    return (
      <Container>
        <Header>
          {
            !boomed ? (
              <>
              <h1>{remainingMines > 0 ? 'Keep Going' : 'Winner'}</h1>
              <button onClick={this.startGame}>Reset</button>
              </>
            ) : (
              <h1>You Lose</h1>
            )
          }
        </Header>
        {
          !loading ? (
            plantField.map((f, fI) => 
              <Field key={`f${fI}`}>
                {
                  f.map(({ isBoom, isRevealed, value }, bI) => (
                    <Box key={`f${fI}b${bI}`} onClick={() => this.mine(fI, bI)}>
                      {isRevealed || boomed ? isBoom ? "💣" : value : ''}  
                    </Box>
                  ))
                }
              </Field>
            )
          ) : (
            <h1>Loading</h1>
          )
        }
      </Container>
    )
  }
}

export default Home;