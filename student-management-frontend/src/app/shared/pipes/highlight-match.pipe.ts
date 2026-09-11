import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlightMatch',
  standalone: true
})
export class HighlightMatchPipe implements PipeTransform {

  transform(value: unknown, searchText: string): string {
    if (value === null || value === undefined) {
      return '';
    }

    const text = String(value);

    if (!searchText || !searchText.trim()) {
      return text;
    }

    const search = searchText.trim();

    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp(`(${escapedSearch})`, 'gi');

    return text.replace(
      regex,
      '<span class="search-highlight">$1</span>'
    );
  }
}