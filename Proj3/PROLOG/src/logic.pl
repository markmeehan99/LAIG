%Chooses move of Player
% Board - current board
% Player - current Player
% FinalBoard - updated Board to be returned
choose_move(Board, Player, FinalBoard, 'P') :-
    write('\n\nPlayer '), write(Player), write(' turn!\n'),
    display_game(Board),
    get_play(Board, Player, ValidatedRow, ValidatedColumn, NewRow, NewColumn, FinalBoard1, Board),
    display_game(FinalBoard1),
    get_play(FinalBoard1, Player, ValidatedRow2, ValidatedColumn2, NewRow2, NewColumn2, FinalBoard, Board).

% Gets play of a given player
get_play(Board, Player, ValidatedRow, ValidatedColumn, NewRow, NewColumn, FinalBoard, PreviousBoard) :-
    check_game_over(Board, Winner),
    Winner \= 1,
    Winner \= 0,
    repeat,
    manageRow(CurrentRow),
    manageColumn(CurrentColumn),
    piece_color(Board, Player, CurrentRow, CurrentColumn, ValidatedRow, ValidatedColumn),
    get_move(Move),
    validate_boundaries(Board, Move, ValidatedRow, ValidatedColumn),
    validate_push(Board, Player, Move, ValidatedRow, ValidatedColumn, NewerMove, FinalBoard),
    checkNullMove(FinalBoard, PreviousBoard),
    !.

% Check if move is not null
checkNullMove(Board1, Board2):-
    Board1 == Board2,
    write('This play will make your 2 plays null, chose another move\n'),
    fail.

checkNullMove(Board1, Board2):-
    Board1 \= Board2.


% Validates if push is valid, or player's pieces are outnumbered
validate_push(Board, Player, NewMove, Row, Column, NewerMove, FinalBoard):-
    update_coords(NewMove, Row, Column, TestRow, TestColumn),
    getValueFromMatrix(Board, TestRow, TestColumn, Value),
    manageTypeMatrix(Value, Player, Board, NewMove, Row, Column, TestRow, TestColumn, FinalBoard).


% Replaces validates cells in Board
manageTypeMatrix(empty, Player, Board, NewMove, OldRow, OldColumn, Row, Column, FinalBoard):-
    replaceInMatrix(Board, OldRow, OldColumn, empty, NewBoard),
    replaceInMatrix(NewBoard, Row, Column, Player, FinalBoard).


manageTypeMatrix(black, black,  Board, NewMove, OldRow, OldColumn, Row, Column, FinalBoard):-
    Counter = 2,
    check_next_pos_line(Board, black, NewMove, Row, Column, Counter, FinalCounter, Collision),
    notifyCounter(FinalCounter),
    replaceLineInMatrix(Board, NewMove, OldRow, OldColumn, black, FinalCounter, FinalBoard, Collision).
    


manageTypeMatrix(black, white,  Board, NewMove, OldRow, OldColumn, Row, Column, FinalBoard):-
    fail.
    

manageTypeMatrix(white, white,  Board, NewMove, OldRow, OldColumn, Row, Column, FinalBoard):-
    Counter = 2,
    check_next_pos_line(Board, white, NewMove, Row, Column, Counter, FinalCounter, Collision),
    notifyCounter(FinalCounter),
    write('saiuuuuuu\n'),
    replaceLineInMatrix(Board, NewMove, OldRow, OldColumn, white, FinalCounter, FinalBoard, Collision).

manageTypeMatrix(white, black,  Board, NewMove, OldRow, OldColumn, Row, Column, FinalBoard):-
    fail.



% CHECKS NEXT POSITION FOR A LINE
check_next_pos_line(Board, Player, Move, Row, Column, Counter, FinalCounter, Collision):-
    update_coords(Move, Row, Column, TestRow, TestColumn),
    getValueFromMatrix(Board, TestRow, TestColumn, Value),
    manageCounterLine(Board, Player, Value, Move, TestRow, TestColumn, Counter, FinalCounter, Collision).

% CHECKS NEXT POSITION FOR AN ANTI-LINE
check_next_pos_anti_line(Board, Player, Move, Row, Column, Counter, FinalCounter):-
    update_coords(Move, Row, Column, TestRow, TestColumn),
    getValueFromMatrix(Board, TestRow, TestColumn, Value),
    manageCounterAntiLine(Board, Player, Value, Move, TestRow, TestColumn, Counter, FinalCounter).


% LINE COUNTER MANAGER
manageCounterLine(Board, Player, empty, Move, Row, Column, Counter, FinalCounter, Collision):-
    FinalCounter is Counter,
    validate_boundaries_suicide(Board, Move, Row, Column),
    manageCollision(Counter, 0, Collision).

manageCounterLine(Board, black, black, Move, Row, Column, Counter, FinalCounter, Collision):-
    NewCounter is Counter + 1,
    check_next_pos_line(Board, black, Move, Row, Column, NewCounter, FinalCounter, Collision).

manageCounterLine(Board, white, white, Move, Row, Column, Counter, FinalCounter, Collision):-
    NewCounter is Counter + 1,
    check_next_pos_line(Board, white, Move, Row, Column, NewCounter, FinalCounter, Collision).

manageCounterLine(Board, black, white, Move, Row, Column, Counter, FinalCounter, Collision):-
    NewCounter is Counter - 1,
    manageCollision(Counter, 1, Collision),
    check_next_pos_anti_line(Board, black, Move, Row, Column, NewCounter, FinalCounter).

manageCounterLine(Board, white, black, Move, Row, Column, Counter, FinalCounter, Collision):-
    NewCounter is Counter - 1,
    manageCollision(Counter, 1, Collision),
    check_next_pos_anti_line(Board, white, Move, Row, Column, NewCounter, FinalCounter).



% ANTI-LINE COUNTER MANAGER
manageCounterAntiLine(Board, Player, empty, Move, Row, Column, Counter, FinalCounter):-
    FinalCounter is Counter.

manageCounterAntiLine(Board, black, black, Move, Row, Column, Counter, FinalCounter):-
    write('There is another piece of yours on the other side. Try another move.\n'),
    FinalCounter is Counter,
    fail.

manageCounterAntiLine(Board, white, white, Move, Row, Column, Counter, FinalCounter):-
    write('There is another piece of yours on the other side. Try another move.\n'),
    FinalCounter is Counter,
    write(FinalCounter), write(' \n'),
    fail.

manageCounterAntiLine(Board, black, white, Move, Row, Column, Counter, FinalCounter):-
    NewCounter is Counter - 1,
    check_next_pos_anti_line(Board, black, Move, Row, Column, NewCounter, FinalCounter).

manageCounterAntiLine(Board, white, black, Move, Row, Column, Counter, FinalCounter):-
    NewCounter is Counter - 1,
    check_next_pos_anti_line(Board, white, Move, Row, Column, NewCounter, FinalCounter).



% FinalCounter Notifier
notifyCounter(Counter):-
    Counter > 0,
    write('Can Push!\n').

notifyCounter(Counter):-
    Counter < 1,
    write('Cant Push! Try Again.\n'),
    fail.

% COLLISION HANDLER
manageCollision(3, 1, Collision):-
    Collision = 2.

manageCollision(Counter, 1, Collision):-
    Collision = 1.

manageCollision(Counter, One, Collision):-
    Collision = 0.


% REPLACE LINES IN MATRIX
replaceLineInMatrix(Board, Move, OldRow, OldColumn, Player, 1, FinalBoard, 1):-
    replaceInMatrix(Board, OldRow, OldColumn, empty, NewBoard),
    update_coords(Move, OldRow, OldColumn, TestRow1, TestColumn1),
    replaceInMatrix(NewBoard, TestRow1, TestColumn1, Player, TestBoard1),
    update_coords(Move, TestRow1, TestColumn1, TestRow2, TestColumn2),
    replaceInMatrix(TestBoard1, TestRow2, TestColumn2, Player, TestBoard2),
    invertPlayer(Player, InvertedPlayer),
    update_coords(Move, TestRow2, TestColumn2, TestRow3, TestColumn3),
    replaceInMatrix(TestBoard2, TestRow3, TestColumn3, InvertedPlayer, FinalBoard).


replaceLineInMatrix(Board, Move, OldRow, OldColumn, Player, 1, FinalBoard, 2):-
    replaceInMatrix(Board, OldRow, OldColumn, empty, NewBoard),
    update_coords(Move, OldRow, OldColumn, TestRow1, TestColumn1),
    replaceInMatrix(NewBoard, TestRow1, TestColumn1, Player, TestBoard1),
    update_coords(Move, TestRow1, TestColumn1, TestRow2, TestColumn2),
    replaceInMatrix(TestBoard1, TestRow2, TestColumn2, Player, TestBoard2),
    update_coords(Move, TestRow2, TestColumn2, TestRow3, TestColumn3),
    replaceInMatrix(TestBoard2, TestRow3, TestColumn3, Player, TestBoard3),
    invertPlayer(Player, InvertedPlayer),
    update_coords(Move, TestRow3, TestColumn3, TestRow4, TestColumn4),
    replaceInMatrix(TestBoard3, TestRow4, TestColumn4, InvertedPlayer, TestBoard4),
    update_coords(Move, TestRow4, TestColumn4, TestRow5, TestColumn5),
    replaceInMatrix(TestBoard4, TestRow5, TestColumn5, InvertedPlayer, FinalBoard).


replaceLineInMatrix(Board, Move, OldRow, OldColumn, Player, 2, FinalBoard, 2):-
    replaceInMatrix(Board, OldRow, OldColumn, empty, NewBoard),
    update_coords(Move, OldRow, OldColumn, TestRow1, TestColumn1),
    replaceInMatrix(NewBoard, TestRow1, TestColumn1, Player, TestBoard1),
    update_coords(Move, TestRow1, TestColumn1, TestRow2, TestColumn2),
    replaceInMatrix(TestBoard1, TestRow2, TestColumn2, Player, TestBoard2),
    update_coords(Move, TestRow2, TestColumn2, TestRow3, TestColumn3),
    replaceInMatrix(TestBoard2, TestRow3, TestColumn3, Player, TestBoard3),
    invertPlayer(Player, InvertedPlayer),
    update_coords(Move, TestRow3, TestColumn3, TestRow4, TestColumn4),
    replaceInMatrix(TestBoard3, TestRow4, TestColumn4, InvertedPlayer, FinalBoard).


replaceLineInMatrix(Board, Move, OldRow, OldColumn, Player, 2, FinalBoard, 0):-
    replaceInMatrix(Board, OldRow, OldColumn, empty, NewBoard),
    update_coords(Move, OldRow, OldColumn, TestRow1, TestColumn1),
    replaceInMatrix(NewBoard, TestRow1, TestColumn1, Player, TestBoard1),
    update_coords(Move, TestRow1, TestColumn1, TestRow2, TestColumn2),
    replaceInMatrix(TestBoard1, TestRow2, TestColumn2, Player, FinalBoard).


replaceLineInMatrix(Board, Move, OldRow, OldColumn, Player, 3, FinalBoard, 0):-
    replaceInMatrix(Board, OldRow, OldColumn, empty, NewBoard),
    update_coords(Move, OldRow, OldColumn, TestRow1, TestColumn1),
    replaceInMatrix(NewBoard, TestRow1, TestColumn1, Player, TestBoard1),
    update_coords(Move, TestRow1, TestColumn1, TestRow2, TestColumn2),
    replaceInMatrix(TestBoard1, TestRow2, TestColumn2, Player, TestBoard2),
    update_coords(Move, TestRow2, TestColumn2, TestRow3, TestColumn3),
    replaceInMatrix(TestBoard2, TestRow3, TestColumn3, Player, FinalBoard).



% Checks if the selected piece's color is correct, taking into account the Player
piece_color(Board, Player, Row, Column, FinalRow, FinalColumn) :-
    getValueFromMatrix(Board, Row, Column, Value),
    Value == Player,
    write('Correct cell selected\n'),
    FinalRow is Row,
    FinalColumn is Column.


% If the selected piece is not the right color, asks for another piece to be selected
piece_color(Board, Player, Row, Column, FinalRow, FinalColumn) :-
    % write(Row), write(Column),
    getValueFromMatrix(Board, Row, Column, Value),
    Value \= Player,
    write('Selected cell does not contain a piece of the correct color.\n'),
    write('Choose the coords for the cell to move.\n'),
    false.
    

% Checks if the cell to be moved into is empty
empty_space(Board, Player, Row, Column, FinalRow, FinalColumn) :-
    getValueFromMatrix(Board, Row, Column, Value),
    Value == empty,
    FinalRow is Row,
    FinalColumn is Column.



% Update coordinates (CurrentRow, CurrentColumn) to (NewRow, NewColumn) given a Move
update_coords(Move, CurrentRow, CurrentColumn, NewRow, NewColumn) :-
    Move == u,
    NewRow is CurrentRow - 1,
    NewColumn is CurrentColumn.

update_coords(Move, CurrentRow, CurrentColumn, NewRow, NewColumn) :-
    Move == d,
    NewRow is CurrentRow + 1,
    NewColumn is CurrentColumn.

update_coords(Move, CurrentRow, CurrentColumn, NewRow, NewColumn) :-
    Move == l,
    NewColumn is CurrentColumn - 1,
    NewRow is CurrentRow.

update_coords(Move, CurrentRow, CurrentColumn, NewRow, NewColumn) :-
    Move == r,
    NewColumn is CurrentColumn + 1,
    NewRow is CurrentRow.

update_coords(Move, CurrentRow, CurrentColumn, NewRow, NewColumn) :-
    not(Move == r),
    not(Move == l),
    not(Move == u),
    not(Move == d),
    write('Move is not valid\n'), write(Move), write('\n').


get_move(MoveS) :-
    write('> Move:    (U,D,R,L)\n'),
    read(Char),
    MoveS = Char,
    write(MoveS).


%  MOVES OUT OF BOUNDARIES
validate_boundaries(Board, u, 1, CurrentColumn):-
    write('ERROR: That move is not valid! UP\n\n'),
    false.

validate_boundaries(Board, d, 5, CurrentColumn):-
    write('ERROR: That move is not valid! DOWN\n\n'),
    false.

validate_boundaries(Board, r, CurrentRow, 5):-
    write('ERROR: That move is not valid! RIGHT\n\n'),
    false.

validate_boundaries(Board, l, CurrentRow, 1):-
    write('ERROR: That move is not valid! LEFT\n\n'),
    false.


% Checks that player is not commiting suicice
validate_boundaries_suicide(Board, u, 0, CurrentColumn):-
    write('ERROR: That move is not valid! SUICIDE UP\n\n'),
    false.

validate_boundaries_suicide(Board, d, 6, CurrentColumn):-
    write('ERROR: That move is not valid! SUICIDE DOWN\n\n'),
    false.

validate_boundaries_suicide(Board, r, CurrentRow, 6):-
    write('ERROR: That move is not valid! SUICIDE RIGHT\n\n'),
    false.

validate_boundaries_suicide(Board, l, CurrentRow, 0):-
    write('ERROR: That move is not valid! SUICIDE LEFT\n\n'),
    false.


validate_boundaries(Board, u, CurrentRow, CurrentColumn):-
    CurrentRow > 1.

validate_boundaries(Board, d, CurrentRow, CurrentColumn):-
    CurrentRow < 5.

validate_boundaries(Board, r, CurrentRow, CurrentColumn):-
    CurrentColumn < 5.

validate_boundaries(Board, l, CurrentRow, CurrentColumn):-
    CurrentColumn > 1.



validate_boundaries_suicide(Board, u, CurrentRow, CurrentColumn):-
    CurrentRow > 0.

validate_boundaries_suicide(Board, d, CurrentRow, CurrentColumn):-
    CurrentRow < 6.

validate_boundaries_suicide(Board, r, CurrentRow, CurrentColumn):-
    CurrentColumn < 6.

validate_boundaries_suicide(Board, l, CurrentRow, CurrentColumn):-
    CurrentColumn > 0.


% MOVES INTO OPOSITE PIECE
check_empty(Board, NLine, NCol, NextBoard, Player, Computer):-
	getPiece(Board, NLine, NCol, X),
	X == empty, setPiece(Board, NLine, NCol, Player, NextBoard);
    X \= empty, write('There is already a piece there! Try again!'), nl, check_empty(Board, NLine, NCol, NextBoard, Player, Computer).



validate_cell(Player, CurrentRow, CurrentRow) :-
    getValueFromMatrix(Board, CurrentRow, CurrentColumn, Elem).


manageRow(CurrentRow) :-
    readRow(Row),
    validateRow(Row, CurrentRow).

manageColumn(CurrentColumn) :-
    readColumn(Column),
    validateColumn(Column, CurrentColumn).

readRow(Row) :-
    write('> Row:   (1, 2, 3, 4, 5)\n'),
    read(Row),
    write('\n').

readColumn(Column) :-
    write('> Column:    (A, B, C, D, E)\n'),
    read(Column),
    write('\n').


validateRow(1, CurrentRow) :-
    CurrentRow = 1.

validateRow(2, CurrentRow) :-
    CurrentRow = 2.

validateRow(3, CurrentRow) :-
    CurrentRow = 3.

validateRow(4, CurrentRow) :-
    CurrentRow = 4.

validateRow(5, CurrentRow) :-
    CurrentRow = 5.


validateColumn(a, CurrentColumn) :-
    CurrentColumn = 1.

validateColumn(b, CurrentColumn) :-
    CurrentColumn = 2.

validateColumn(c, CurrentColumn) :-
    CurrentColumn = 3.

validateColumn(d, CurrentColumn) :-
    CurrentColumn = 4.

validateColumn(e, CurrentColumn) :-
    CurrentColumn = 5.

validateColumn(Row, CurrentColumn) :-
    not(Row==a),
    not(Row==b),
    not(Row==c),
    not(Row==d),
    not(Row==e),
    write('ERROR: That column is not valid!\n\n'),
    write(Row), write('\n\n'),
    manageColumn(CurrentColumn).
