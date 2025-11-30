import { css } from '@emotion/react';
import { Cell, Header } from '@tanstack/react-table';

export interface ColumnMetaStyle {
  header?: StyleMeta;
  cell?: StyleMeta;
}

export interface StyleMeta {
  className?: string;
  width?: string;
  height?: string;
}

export function getStyleHeader<T>(header: Header<T, unknown>) {
  const meta = header.column.columnDef.meta as ColumnMetaStyle | undefined;
  const cn = meta?.header?.className || undefined;
  const style = meta?.header ? getStyle(meta.header) : undefined;
  return { cn, style };
}

export function getStyleCell<T>(cell: Cell<T, unknown>) {
  const meta = cell.column.columnDef.meta as ColumnMetaStyle | undefined;
  const cn = meta?.cell?.className || undefined;
  const style = meta?.cell ? getStyle(meta.cell) : undefined;
  return { cn, style };
}

function getStyle(style: StyleMeta) {
  const { width, height } = style;
  return css({ width, height });
}
