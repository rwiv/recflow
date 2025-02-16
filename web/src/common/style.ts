import { Cell, Header } from '@tanstack/react-table';
import { css } from '@emotion/react';

export interface ColumnMetaStyle {
  header?: StyleMeta;
  cell?: StyleMeta;
}

export interface StyleMeta {
  className?: string;
  width?: string;
}

export function getStyleHeader<T>(header: Header<T, unknown>) {
  const meta = header.column.columnDef.meta as ColumnMetaStyle | undefined;
  const cn = meta?.header?.className || undefined;
  const style = meta?.header?.width ? css({ width: meta.header.width }) : undefined;
  return { cn, style };
}

export function getStyleCell<T>(cell: Cell<T, unknown>) {
  const meta = cell.column.columnDef.meta as ColumnMetaStyle | undefined;
  const cn = meta?.cell?.className || undefined;
  const style = meta?.cell?.width ? css({ width: meta.cell.width }) : undefined;
  return { cn, style };
}

export function switchBatchCn(flag: boolean) {
  return flag ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';
}
