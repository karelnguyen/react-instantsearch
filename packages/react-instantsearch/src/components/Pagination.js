import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { range } from 'lodash';

import { capitalize } from '../core/utils';
import translatable from '../core/translatable';
import LinkList from './LinkList';
import BaseWidget from './BaseWidget';
import classNames from './classNames.js';

const widgetClassName = 'Pagination';
const cx = classNames(widgetClassName);

// Determines the size of the widget (the number of pages displayed - that the user can directly click on)
function calculateSize(padding, maxPages) {
  return Math.min(2 * padding + 1, maxPages);
}

function calculatePaddingLeft(currentPage, padding, maxPages, size) {
  if (currentPage <= padding) {
    return currentPage;
  }

  if (currentPage >= maxPages - padding) {
    return size - (maxPages - currentPage);
  }

  return padding + 1;
}

// Retrieve the correct page range to populate the widget
function getPages(currentPage, maxPages, padding) {
  const size = calculateSize(padding, maxPages);
  // If the widget size is equal to the max number of pages, return the entire page range
  if (size === maxPages) return range(1, maxPages + 1);

  const paddingLeft = calculatePaddingLeft(
    currentPage,
    padding,
    maxPages,
    size
  );
  const paddingRight = size - paddingLeft;

  const first = currentPage - paddingLeft;
  const last = currentPage + paddingRight;
  return range(first + 1, last + 1);
}

class Pagination extends Component {
  static propTypes = {
    nbPages: PropTypes.number.isRequired,
    currentRefinement: PropTypes.number.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    canRefine: PropTypes.bool.isRequired,

    translate: PropTypes.func.isRequired,
    listComponent: PropTypes.func,

    showFirst: PropTypes.bool,
    showPrevious: PropTypes.bool,
    showNext: PropTypes.bool,
    showLast: PropTypes.bool,
    pagesPadding: PropTypes.number,
    maxPages: PropTypes.number,
    header: PropTypes.node,
    footer: PropTypes.node,
  };

  static defaultProps = {
    listComponent: LinkList,
    showFirst: true,
    showPrevious: true,
    showNext: true,
    showLast: false,
    pagesPadding: 3,
    maxPages: Infinity,
  };

  static contextTypes = {
    canRefine: PropTypes.func,
  };

  componentWillMount() {
    if (this.context.canRefine) this.context.canRefine(this.props.canRefine);
  }

  componentWillReceiveProps(props) {
    if (this.context.canRefine) this.context.canRefine(props.canRefine);
  }

  getItem(modifier, translationKey, value) {
    const { nbPages, maxPages, translate } = this.props;
    return {
      key: `${modifier}.${value}`,
      modifier,
      disabled: value < 1 || value >= Math.min(maxPages, nbPages),
      label: translate(translationKey, value),
      value,
      ariaLabel: translate(`aria${capitalize(translationKey)}`, value),
    };
  }

  render() {
    const {
      nbPages,
      maxPages,
      currentRefinement,
      pagesPadding,
      showFirst,
      showPrevious,
      showNext,
      showLast,
      refine,
      createURL,
      translate,
      header,
      footer,
      listComponent: ListComponent,
      ...otherProps
    } = this.props;
    const totalPages = Math.min(nbPages, maxPages);
    const lastPage = totalPages;

    let items = [];
    if (showFirst) {
      items.push({
        key: 'first',
        modifier: 'item--firstPage',
        disabled: currentRefinement === 1,
        label: translate('first'),
        value: 1,
        ariaLabel: translate('ariaFirst'),
      });
    }
    if (showPrevious) {
      items.push({
        key: 'previous',
        modifier: 'item--previousPage',
        disabled: currentRefinement === 1,
        label: translate('previous'),
        value: currentRefinement - 1,
        ariaLabel: translate('ariaPrevious'),
      });
    }

    items = items.concat(
      getPages(currentRefinement, totalPages, pagesPadding).map(value => ({
        key: value,
        modifier: 'item--page',
        label: translate('page', value),
        value,
        selected: value === currentRefinement,
        ariaLabel: translate('ariaPage', value),
      }))
    );
    if (showNext) {
      items.push({
        key: 'next',
        modifier: 'item--nextPage',
        disabled: currentRefinement === lastPage || lastPage <= 1,
        label: translate('next'),
        value: currentRefinement + 1,
        ariaLabel: translate('ariaNext'),
      });
    }
    if (showLast) {
      items.push({
        key: 'last',
        modifier: 'item--lastPage',
        disabled: currentRefinement === lastPage || lastPage <= 1,
        label: translate('last'),
        value: lastPage,
        ariaLabel: translate('ariaLast'),
      });
    }

    return (
      <BaseWidget
        widgetClassName={widgetClassName}
        header={header}
        footer={footer}
      >
        <ListComponent
          {...otherProps}
          cx={cx}
          items={items}
          onSelect={refine}
          createURL={createURL}
        />
      </BaseWidget>
    );
  }
}

export default translatable({
  previous: '‹',
  next: '›',
  first: '«',
  last: '»',
  page: currentRefinement => currentRefinement.toString(),
  ariaPrevious: 'Previous page',
  ariaNext: 'Next page',
  ariaFirst: 'First page',
  ariaLast: 'Last page',
  ariaPage: currentRefinement => `Page ${currentRefinement.toString()}`,
})(Pagination);
