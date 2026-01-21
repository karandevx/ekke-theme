export const PLP_PRODUCTS = `query products(
  $search: String
  $filterQuery: String
  $enableFilter: Boolean
  $sortOn: String
  $first: Int
  $pageNo: Int
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
    after: $after
    pageType: $pageType
  ) {
    filters {
      key {
        display
        kind
        logo
        name
      }
      values {
        count
        currency_code
        currency_symbol
        display
        display_format
        is_selected
        max
        min
        query_format
        selected_max
        selected_min
        value
      }
    }
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
        action {
          page {
            params
            type
            query
          }
          type
        }
        brand {
            name
        }
        action {
          page {
            params
            query
            type
          }
          type
        }
        price {
            effective {
                currency_code
                currency_symbol
                max
                min
            }
            marked {
                currency_code
                currency_symbol
                max
                min
            }
        }
        media {
            alt
            type
            url
        }
        variants {
          display_type
          header
          items {
            _custom_meta {
              key
              value
            }
            color
            color_name
            is_available
            medias {
              alt
              type
              url
            }
            name
            slug
            uid
            value
          }
          key
          total
        }
        slug
        uid
        sellable
        teaser_tag
        discount
        name
        product_online_date
        sizes
    }
  }
}
`;

export const GET_QUICK_VIEW_PRODUCT_DETAILS = `query($slug: String!)  {
  product(slug: $slug) {
    brand {
      name
      uid
    }
    color
    item_code
    item_type
    has_variant
    uid
    custom_config
    media {
      alt
      meta {
        source
      }
      type
      url
    }
    sizes {
      discount
      multi_size
      sellable
      size_chart {
        description
        headers {
          col_1 {
            convertable
            value
          }
          col_2 {
            convertable
            value
          }
          col_3 {
            convertable
            value
          }
          col_4 {
            convertable
            value
          }
          col_5 {
            convertable
            value
          }
          col_6 {
            convertable
            value
          }
        }
        image
        size_tip
        sizes {
          col_1
          col_2
          col_3
          col_4
          col_5
          col_6
        }
        title
        unit
      }
      sizes:size_details {
        dimension {
          height
          is_default
          length
          unit
          width
        }
        display
        is_available
        quantity
        seller_identifiers
        value
        weight {
          is_default
          shipping
          unit
        }
      }
      stores {
        count
      }
      price {
        effective {
            currency_code
            currency_symbol
            max
            min
          }
          marked {
            currency_code
            currency_symbol
            max
            min
          }  
      }
    }
    custom_order {
      is_custom_order
      manufacturing_time
      manufacturing_time_unit
    }
    description
    discount
    moq {
      increment_unit
      maximum
      minimum
    }
    name
    net_quantity {
      unit
      value
    }
    price {
      effective {
        currency_code
        currency_symbol
        max
        min
      }
      marked {
        currency_code
        currency_symbol
        max
        min
      }
    }
    rating
    rating_count
    seo {
      description
      title
    }
    short_description
    slug
    type
    variants {
      display_type
      header
      items {
        _custom_meta {
          key
          value
        }
        color
        color_name
        is_available
        medias {
          alt
          type
          url
        }
        name
        slug
        uid
        value
      }
      key
    }
    action {
      page {
        params
        query
        type
      }
      type
    }
  }
}`;

export const BRAND_META = `query brand($slug: String!) {
  brand(slug: $slug) {
    description
    logo {
      alt
      type
      url
    }
    name
    slug
  }
}
`;

export const CATEGORY_META = `query Category($slug: String!) {
    category(slug: $slug) {
        banners {
            landscape {
                alt
                type
                url
            }
            portrait {
                alt
                type
                url
                meta {
                    source
                }
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
        name
        uid
    }
}
`;

export const PLP_ADD_TO_CART = `mutation AddItemsToCart($buyNow: Boolean, $addCartRequestInput: AddCartRequestInput) {
  addItemsToCart(buyNow: $buyNow, addCartRequestInput:$addCartRequestInput) {
    message
    partial
    success
    cart {
      buy_now
      cart_id
      checkout_mode
      comment
      coupon_text
      delivery_charge_info
      delivery_promise {
        formatted {
          max
          min
        }
        timestamp {
          max
          min
        }
      }
      gstin
      id
      is_valid
      last_modified
      message
      notification
      pan_config
      pan_no
      restrict_checkout
      user_cart_items_count
      staff_user_id
      success
      uid
       items {
                coupon_message
                custom_order
                discount
                is_set
                key
                message
                moq
                parent_item_identifiers
                product_ean_id
                quantity
                bulk_offer
                article {
                    _custom_json
                    cart_item_meta
                    extra_meta
                    gift_card
                    identifier
                    is_gift_visible
                    meta
                    mto_quantity
                    parent_item_identifiers
                    product_group_tags
                    quantity
                    seller_identifier
                    size
                    tags
                    type
                    uid
                    price {
                        base {
                            currency_code
                            currency_symbol
                            effective
                            marked
                            selling
                        }
                        converted {
                            currency_code
                            currency_symbol
                            effective
                            marked
                            selling
                        }
                    }
                    seller {
                        name
                        uid
                    }
                    store {
                        name
                        store_code
                        uid
                    }
                }
                availability {
                    deliverable
                    is_valid
                    other_store_quantity
                    out_of_stock
                    sizes
                    available_sizes {
                        display
                        is_available
                        value
                    }
                }
                charges {
                    meta
                    name
                    allow_refund
                    code
                    type
                    amount {
                        currency
                        value
                    }
                }
                delivery_promise {
                    formatted {
                        max
                        min
                    }
                    timestamp {
                        max
                        min
                    }
                    iso {
                        max
                        min
                    }
                }
                identifiers {
                    identifier
                }
                price {
                    base {
                        add_on
                        currency_code
                        currency_symbol
                        effective
                        marked
                        selling
                    }
                    converted {
                        add_on
                        currency_code
                        currency_symbol
                        effective
                        marked
                        selling
                    }
                }
                price_per_unit {
                    base {
                        add_on
                        currency_code
                        currency_symbol
                        effective
                        marked
                        selling_price
                    }
                    converted {
                        add_on
                        currency_code
                        currency_symbol
                        effective
                        marked
                        selling_price
                    }
                }
                product {
                    _custom_json
                    attributes
                    item_code
                    name
                    slug
                    tags
                    type
                    uid
                    brand {
                        name
                        uid
                    }
                    categories {
                        name
                        uid
                    }
                    images {
                        aspect_ratio
                        secure_url
                        url
                    }
                    teaser_tag {
                        tags
                    }
                }
                promo_meta {
                    message
                }
            }
    }
  }
}`;
