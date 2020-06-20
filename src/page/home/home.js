import React from 'react';
import { Container, Box, Field, Header } from './component';
import { size, boxSize } from '../../shared/config';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      size,
      bombsTotal: undefined,
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
       this.setState({ bombsTotal: size }, () => {
         this.startGame();
       })
    }
  }

  startGame = () => {
    this.eraseGameProgress();
    this.setRemainingBox(true);
    this.formPlantField();
  }

  setRemainingBox = (first, revealedTotal) => {
    if (first) {
      const { size, bombsTotal } = this.state;
      this.setState({ remainingMines: size ** 2 - bombsTotal, boomed: false }); 
    } else {
      const { remainingMines } = this.state;
      this.setState({ remainingMines: remainingMines - revealedTotal }, () => {
        this.storeGameProgress();
      })
    }
  }

  formPlantField = () => {
    const { size } = this.state;
    const plantField = [...Array(size)].map(() => {
      const f = [...Array(size)].map(() => ({ isMine: false, value: 0, isRevealed: false, isBomb: false }))
      return f;
    })
    this.setState({ plantField }, () => {
      this.plantBombs();
    })
  }

  plantBombs = () => {
    const { bombsTotal, size, plantField } = this.state;
    let total = bombsTotal;
    console.log(bombsTotal);
    let locs = [];
    while (total > 0) {
      const [locX, locY] =  [this.getRandomPlant(size), this.getRandomPlant(size)];
      const plant = plantField[locX][locY];
      if (plant.isBomb) {
        continue
      }
      plant.isBomb = true;
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
        if (f.isBomb) {
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
        const [plant, revealedTotal] = this.revealZero(x, y, plantField);
        this.setState({ plantField: plant }, () => {
          this.setRemainingBox(false, revealedTotal + 1);
        })
      }
    }
  }

  checkIsBomb = (x, y) => {
    const { bombsLoc } = this.state;
    return bombsLoc.indexOf(`${x},${y}`) >= 0;
  }

  revealZero = (x, y, plantField) => {
    const { size } = this.state;
    const boxIdx = x * size + y;
    let revealedTotal = 0;
    for (let i = boxIdx + 1; i < size**2; i++) {
      const newBoxIndex = boxIdx + (i - boxIdx)
      const [aX, aY] = [Math.floor(newBoxIndex / size), newBoxIndex % size];
      const pxy = plantField[aX][aY];
      if (!pxy.isBomb && !pxy.isRevealed) {
        plantField[aX][aY].isRevealed = true
        revealedTotal += 1
      } else {
        break;
      }
    }
    for (let j = boxIdx - 1; j >= 0; j--) {
      const newBoxIndex = boxIdx + (j - boxIdx)
      const [aX, aY] = [Math.floor(newBoxIndex / size), newBoxIndex % size];
      const pxy = plantField[aX][aY];
      if (!pxy.isBomb && !pxy.isRevealed) {
        plantField[aX][aY].isRevealed = true
        revealedTotal += 1
      } else {
        break;
      }
    }
    return [plantField, revealedTotal];
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
    const won = remainingMines === 0;
    return (
      <Container size={size} boxSize={boxSize}>
        <Header>
          {
            !boomed ? (
              <h1>{won ? 'Winner' : 'Keep Going'}</h1>
            ) : (
              <h1>You Lose</h1>
            )
          }
          <button onClick={this.startGame}>{boomed || won ? "Restart" : "Reset"}</button>
        </Header>
        {
          !loading ? (
            plantField.map((f, fI) => 
              <Field key={`f${fI}`}>
                {
                  f.map(({ isBomb, isRevealed, value }, bI) => (
                    <Box
                      key={`f${fI}b${bI}`}
                      onClick={() => this.mine(fI, bI)} 
                      revealed={isRevealed || boomed}
                      boxSize={boxSize}
                    >
                      {isRevealed || boomed || won ? isBomb ? won ? "🚩" : "💣" : value : ''}  
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