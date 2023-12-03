import { Optional } from "./optional";

export interface CoOrdinate {
  row: number;
  cell: number;
}

function isCoOrdinate(value: unknown): value is CoOrdinate {
  return (
    typeof value === "object" &&
    Object.keys(value)?.length === 2 &&
    "row" in value &&
    "cell" in value
  );
}

export class Cell<T> {
  constructor(public readonly content: T) {}
}

export class Row<T> {
  constructor(private readonly _cells: Cell<T>[] = []) {}

  public addCellWithContent(value: T): void {
    this._cells.push(new Cell(value));
  }

  public addCellsWithContent(...values: T[]): void {
    this._cells.concat(values.map((v) => new Cell(v)));
  }

  public getCell(cell: number): Optional<Cell<T>>;
  public getCell(coOrdinate: CoOrdinate): Optional<Cell<T>>;
  public getCell(value: number | CoOrdinate): Optional<Cell<T>> {
    const cellIndex: number = isCoOrdinate(value) ? value.cell : value;
    return cellIndex < this._cells.length && cellIndex > -1
      ? Optional.of(this._cells[cellIndex])
      : Optional.empty();
  }

  public getNextCell(cell: number): Optional<Cell<T>>;
  public getNextCell(coOrdinate: CoOrdinate): Optional<Cell<T>>;
  public getNextCell(value: number | CoOrdinate): Optional<Cell<T>> {
    return this.getCell(isCoOrdinate(value) ? value.cell + 1 : value + 1);
  }

  public getPreviousCell(cell: number): Optional<Cell<T>>;
  public getPreviousCell(coOrdinate: CoOrdinate): Optional<Cell<T>>;
  public getPreviousCell(value: number | CoOrdinate): Optional<Cell<T>> {
    return this.getCell(isCoOrdinate(value) ? value.cell - 1 : value - 1);
  }

  public getFirstCell(): Optional<Cell<T>> {
    return this.getCell(0);
  }

  public getLastCell(): Optional<Cell<T>> {
    return this.getCell(this._cells.length - 1);
  }
}

export class Grid<T> {
  constructor(private _rows: Row<T>[]) {}

  public getRow(row: number): Optional<Row<T>>;
  public getRow(coOrdinate: CoOrdinate): Optional<Row<T>>;
  public getRow(value: number | CoOrdinate): Optional<Row<T>> {
    const rowIndex: number = isCoOrdinate(value) ? value.row : value;
    return rowIndex < this._rows.length && rowIndex > -1
      ? Optional.of(this._rows[rowIndex])
      : Optional.empty();
  }

  public getPreviousRow(row: number): Optional<Row<T>>;
  public getPreviousRow(coOrdinate: CoOrdinate): Optional<Row<T>>;
  public getPreviousRow(value: number | CoOrdinate): Optional<Row<T>> {
    return this.getRow(isCoOrdinate(value) ? value.row - 1 : value - 1);
  }

  public getNextRow(row: number): Optional<Row<T>>;
  public getNextRow(coOrdinate: CoOrdinate): Optional<Row<T>>;
  public getNextRow(value: number | CoOrdinate): Optional<Row<T>> {
    return this.getRow(isCoOrdinate(value) ? value.row + 1 : value + 1);
  }

  public getCell(coOrdinate: CoOrdinate): Optional<Cell<T>> {
    return this.getRow(coOrdinate).mapIfPresent((row: Row<T>) =>
      row.getCell(coOrdinate),
    );
  }

  public getPreviousCell(
    coOrdinate: CoOrdinate,
    wrap: boolean = true,
  ): Optional<Cell<T>> {
    return this.getRow(coOrdinate)
      .mapIfPresent((row: Row<T>) => row.getPreviousCell(coOrdinate))
      .orElse(
        wrap
          ? this.getPreviousRow(coOrdinate).mapIfPresent((row: Row<T>) =>
              row.getLastCell(),
            )
          : Optional.empty(),
      );
  }

  public getNextCell(
    coOrdinate: CoOrdinate,
    wrap: boolean = true,
  ): Optional<Cell<T>> {
    return this.getRow(coOrdinate)
      .mapIfPresent((row: Row<T>) => row.getNextCell(coOrdinate))
      .orElse(
        wrap
          ? this.getNextRow(coOrdinate).mapIfPresent((row: Row<T>) =>
              row.getFirstCell(),
            )
          : Optional.empty(),
      );
  }

  public getCellAbove(coOrdinate: CoOrdinate): Optional<Cell<T>> {
    return this.getPreviousRow(coOrdinate).mapIfPresent((row: Row<T>) =>
      row.getCell(coOrdinate),
    );
  }

  public getCellBelow(coOrdinate: CoOrdinate): Optional<Cell<T>> {
    return this.getNextRow(coOrdinate).mapIfPresent((row: Row<T>) =>
      row.getCell(coOrdinate),
    );
  }

  public getDiagonalAbovePreviousCell(
    coOrdinate: CoOrdinate,
  ): Optional<Cell<T>> {
    return this.getPreviousRow(coOrdinate).mapIfPresent((row: Row<T>) =>
      row.getPreviousCell(coOrdinate),
    );
  }

  public getDiagonalAboveNextCell(coOrdinate: CoOrdinate): Optional<Cell<T>> {
    return this.getPreviousRow(coOrdinate).mapIfPresent((row: Row<T>) =>
      row.getNextCell(coOrdinate),
    );
  }

  public getDiagonalBelowPreviousCell(
    coOrdinate: CoOrdinate,
  ): Optional<Cell<T>> {
    return this.getNextRow(coOrdinate).mapIfPresent((row: Row<T>) =>
      row.getPreviousCell(coOrdinate),
    );
  }

  public getDiagonalBelowNextCell(coOrdinate: CoOrdinate): Optional<Cell<T>> {
    return this.getNextRow(coOrdinate).mapIfPresent((row: Row<T>) =>
      row.getNextCell(coOrdinate),
    );
  }
}
