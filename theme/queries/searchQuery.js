export const SEARCH_PRODUCT = `query SearchProduct($query: String!) {
  searchProduct(query: $query) {
    items {
      custom_json
      display
      type
      action {
        type
        page {
          params
          query
          type
        }
      }
      logo {
        alt
        type
        url
        meta {
          source
        }
      }
    }
  }
}`;
