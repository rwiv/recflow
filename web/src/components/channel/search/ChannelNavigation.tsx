import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination.tsx';
import { ChannelPageState } from '@/hooks/channel.page.state.ts';

interface PageNavigationProps {
  pageState: ChannelPageState;
  paginationSize: number;
  endPage: number;
}

export function PageNavigation({ pageState: page, paginationSize, endPage }: PageNavigationProps) {
  const disabledCn = 'pointer-events-none select-none opacity-50';
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className={page.curPageNum === 1 ? disabledCn : ''}
            href={`/#/channels?${page.calculated(-1).toQueryString()}`}
          />
        </PaginationItem>
        {getPagination(page.curPageNum, paginationSize, endPage).map((num, idx) => {
          if (num === -1) {
            return (
              <PaginationItem key={idx}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          return (
            <PaginationItem key={idx}>
              <PaginationLink
                href={`/#/channels?${page.withNewPageNum(num).toQueryString()}`}
                isActive={num === page.curPageNum}
              >
                {num}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext
            className={page.curPageNum === endPage ? disabledCn : ''}
            href={`/#/channels?${page.calculated(1).toQueryString()}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function getPagination(cur: number, n: number, endPage: number) {
  const nums = getPageNumList(cur, n, endPage);
  const result = [];
  if (nums[0] !== 1) {
    result.push(1);
    result.push(-1);
  }
  for (const num of nums) {
    if (num > endPage) {
      break;
    }
    result.push(num);
  }
  if (nums[nums.length - 1] < endPage) {
    result.push(-1);
  }
  return result;
}

// function getPageNumList(cur: number, n: number) {
//   const leftCount = Math.floor(n / 2);
//   const start = Math.max(1,  cur - leftCount);
//   return Array.from({ length: n }, (_, i) => start + i);
// }

function getPageNumList(cur: number, n: number, endPage: number) {
  const leftCount = Math.floor(n / 2);
  let start = Math.max(1, cur - leftCount);
  let end = start + n - 1;

  if (end > endPage) {
    end = endPage;
    start = Math.max(1, end - n + 1);
  }

  if (end - start + 1 < n) {
    start = 1;
    end = Math.min(n, endPage);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
