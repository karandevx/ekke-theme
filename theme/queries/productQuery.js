export const PRODUCTS_SEARCH = `query products(
  $search: String
  $filterQuery: String
  $enableFilter: Boolean
  $sortOn: String
  $first: Int
  $pageNo: Int
  $pageSize: Int
  $after: String
  $pageType: String
) {
  products(
    search: $search
    filterQuery: $filterQuery
    enableFilter: $enableFilter
    sortOn: $sortOn
    first: $first
    pageNo: $pageNo
    pageSize: $pageSize
    after: $after
    pageType: $pageType
  ) {
    sort_on {
      display
      is_selected
      logo
      name
      value
    }
    page {
      current
      next_id
      has_previous
      has_next
      item_total
      type
      size
    }
    items {
    media {
        alt
        meta {
          source
        }
        type
        url
      }
      color
      item_code
      item_type
      has_variant
      uid
      attributes
      custom_config
      description
      discount
      highlights
      image_nature
      is_dependent
      name
      product_group_tag
      product_online_date
      rating
      rating_count
      short_description
      similars
      slug
      tags
      teaser_tag
      tryouts
      type
      identifiers
      sizes
      sellable
      country_of_origin
      is_tryout
      channel
    }
  }
}
`;

export const RETURN_CONFIG = `query ReturnConfig($slug: String!, $size: String!) {
    productPrice(slug: $slug, size: $size) {
        return_config {
            returnable
            time
            unit
        }
    }
}`;
