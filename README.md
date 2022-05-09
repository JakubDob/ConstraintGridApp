# ConstraintGridApp

Project consists of 4 parts:
1. Angular web app sends a model
2. Spring app parses the model from the web app and sends it to the solver
3. Solver responds back to the spring app with the result
4. Artemis message broker facilitates the communication between 2 and 3

## Building

```
docker-compose up --build
```

Web app runs on localhost:8080

## Screenshots
### Making a sudoku solver (all numbers must be different in a 3x3 square, horizontal and vertical lines)  

![grid](https://user-images.githubusercontent.com/105197235/167493416-3ee28bc1-46f5-42eb-ba5a-58a9a0d8affd.png)
![solution](https://user-images.githubusercontent.com/105197235/167493660-38d323e2-83fa-4fb4-b4f7-7985f4018eaf.png)

### Solving n-queens problem (at most 1 in a row, column and diagonal)  

![nqueens](https://user-images.githubusercontent.com/105197235/167496605-249af14b-8fab-4d72-9a9d-d1dbc900efd7.png)
![nqueens_solution](https://user-images.githubusercontent.com/105197235/167496633-7930b0e6-b578-4c45-bc1f-0af252ef1fb8.png)
