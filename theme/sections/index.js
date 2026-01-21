import loadable from '@loadable/component';
import React from "react";

const AboutUsSectionChunk = loadable(() => import(/* webpackChunkName:"AboutUsSectionChunk" */ './about-us.jsx'));

const ApplicationBannerSectionChunk = loadable(() => import(/* webpackChunkName:"ApplicationBannerSectionChunk" */ './application-banner.jsx'));

const BannerDetailSectionChunk = loadable(() => import(/* webpackChunkName:"BannerDetailSectionChunk" */ './banner-detail.jsx'));

const BlogSectionChunk = loadable(() => import(/* webpackChunkName:"BlogSectionChunk" */ './blog.jsx'));

const BrandListingSectionChunk = loadable(() => import(/* webpackChunkName:"BrandListingSectionChunk" */ './brand-listing.jsx'));

const BrandsLandingSectionChunk = loadable(() => import(/* webpackChunkName:"BrandsLandingSectionChunk" */ './brands-landing.jsx'));

const BrandsRowGridSectionChunk = loadable(() => import(/* webpackChunkName:"BrandsRowGridSectionChunk" */ './brands-row-grid.jsx'));

const CartLandingSectionChunk = loadable(() => import(/* webpackChunkName:"CartLandingSectionChunk" */ './cart-landing.jsx'));

const CategoriesListingSectionChunk = loadable(() => import(/* webpackChunkName:"CategoriesListingSectionChunk" */ './categories-listing.jsx'));

const CategoriesSectionChunk = loadable(() => import(/* webpackChunkName:"CategoriesSectionChunk" */ './categories.jsx'));

const CategoryCollectiblesSectionChunk = loadable(() => import(/* webpackChunkName:"CategoryCollectiblesSectionChunk" */ './category-collectibles.jsx'));

const CollectionListingSectionChunk = loadable(() => import(/* webpackChunkName:"CollectionListingSectionChunk" */ './collection-listing.jsx'));

const CollectionsListingSectionChunk = loadable(() => import(/* webpackChunkName:"CollectionsListingSectionChunk" */ './collections-listing.jsx'));

const CollectionsSectionChunk = loadable(() => import(/* webpackChunkName:"CollectionsSectionChunk" */ './collections.jsx'));

const ContactUsSectionChunk = loadable(() => import(/* webpackChunkName:"ContactUsSectionChunk" */ './contact-us.jsx'));

const CustomCategoriesSectionChunk = loadable(() => import(/* webpackChunkName:"CustomCategoriesSectionChunk" */ './custom-categories.jsx'));

const CustomCollectionListingSectionChunk = loadable(() => import(/* webpackChunkName:"CustomCollectionListingSectionChunk" */ './custom-collection-listing.jsx'));

const DesignerSectionChunk = loadable(() => import(/* webpackChunkName:"DesignerSectionChunk" */ './designer.jsx'));

const DetailComponentSectionChunk = loadable(() => import(/* webpackChunkName:"DetailComponentSectionChunk" */ './detail-component.jsx'));

const ExclusiveEditionSectionChunk = loadable(() => import(/* webpackChunkName:"ExclusiveEditionSectionChunk" */ './exclusive-edition.jsx'));

const FashionGridSectionChunk = loadable(() => import(/* webpackChunkName:"FashionGridSectionChunk" */ './fashion-grid.jsx'));

const FeatureBlogSectionChunk = loadable(() => import(/* webpackChunkName:"FeatureBlogSectionChunk" */ './feature-blog.jsx'));

const FeaturedCollectionSectionChunk = loadable(() => import(/* webpackChunkName:"FeaturedCollectionSectionChunk" */ './featured-collection.jsx'));

const HeroBannerSectionChunk = loadable(() => import(/* webpackChunkName:"HeroBannerSectionChunk" */ './hero-banner.jsx'));

const HeroImageSectionChunk = loadable(() => import(/* webpackChunkName:"HeroImageSectionChunk" */ './hero-image.jsx'));

const HeroVideoSectionChunk = loadable(() => import(/* webpackChunkName:"HeroVideoSectionChunk" */ './hero-video.jsx'));

const ImageGallerySectionChunk = loadable(() => import(/* webpackChunkName:"ImageGallerySectionChunk" */ './image-gallery.jsx'));

const ImageSlideshowSectionChunk = loadable(() => import(/* webpackChunkName:"ImageSlideshowSectionChunk" */ './image-slideshow.jsx'));

const InfoTextSectionChunk = loadable(() => import(/* webpackChunkName:"InfoTextSectionChunk" */ './info-text.jsx'));

const LinkSectionChunk = loadable(() => import(/* webpackChunkName:"LinkSectionChunk" */ './link.jsx'));

const LoginSectionChunk = loadable(() => import(/* webpackChunkName:"LoginSectionChunk" */ './login.jsx'));

const MediaWithTextSectionChunk = loadable(() => import(/* webpackChunkName:"MediaWithTextSectionChunk" */ './media-with-text.jsx'));

const MultiCollectionProductListSectionChunk = loadable(() => import(/* webpackChunkName:"MultiCollectionProductListSectionChunk" */ './multi-collection-product-list.jsx'));

const MultiRecommendationListSectionChunk = loadable(() => import(/* webpackChunkName:"MultiRecommendationListSectionChunk" */ './multi-recommendation-list.jsx'));

const NewsletterFormSectionChunk = loadable(() => import(/* webpackChunkName:"NewsletterFormSectionChunk" */ './newsletter-form.jsx'));

const OrderDetailsSectionChunk = loadable(() => import(/* webpackChunkName:"OrderDetailsSectionChunk" */ './order-details.jsx'));

const ProductCarouselSectionChunk = loadable(() => import(/* webpackChunkName:"ProductCarouselSectionChunk" */ './product-carousel.jsx'));

const ProductCollectionListingSectionChunk = loadable(() => import(/* webpackChunkName:"ProductCollectionListingSectionChunk" */ './product-collection-listing.jsx'));

const ProductDescriptionSectionChunk = loadable(() => import(/* webpackChunkName:"ProductDescriptionSectionChunk" */ './product-description.jsx'));

const ProductInfoSectionChunk = loadable(() => import(/* webpackChunkName:"ProductInfoSectionChunk" */ './product-info.jsx'));

const ProductListingSectionChunk = loadable(() => import(/* webpackChunkName:"ProductListingSectionChunk" */ './product-listing.jsx'));

const ProductRecommendationSectionChunk = loadable(() => import(/* webpackChunkName:"ProductRecommendationSectionChunk" */ './product-recommendation.jsx'));

const ProductsSliderSectionChunk = loadable(() => import(/* webpackChunkName:"ProductsSliderSectionChunk" */ './products-slider.jsx'));

const RawHtmlSectionChunk = loadable(() => import(/* webpackChunkName:"RawHtmlSectionChunk" */ './raw-html.jsx'));

const RegisterSectionChunk = loadable(() => import(/* webpackChunkName:"RegisterSectionChunk" */ './register.jsx'));

const SitemapSectionChunk = loadable(() => import(/* webpackChunkName:"SitemapSectionChunk" */ './sitemap.jsx'));

const SizingHelpSectionChunk = loadable(() => import(/* webpackChunkName:"SizingHelpSectionChunk" */ './sizing-help.jsx'));

const TestimonialsSectionChunk = loadable(() => import(/* webpackChunkName:"TestimonialsSectionChunk" */ './testimonials.jsx'));

const TrustMarkerSectionChunk = loadable(() => import(/* webpackChunkName:"TrustMarkerSectionChunk" */ './trust-marker.jsx'));


const getbundle = (type) => {
        switch(type) {
            case 'about-us':
            return (props) => <AboutUsSectionChunk {...props}/>;
        case 'application-banner':
            return (props) => <ApplicationBannerSectionChunk {...props}/>;
        case 'banner-detail':
            return (props) => <BannerDetailSectionChunk {...props}/>;
        case 'blog':
            return (props) => <BlogSectionChunk {...props}/>;
        case 'brand-listing':
            return (props) => <BrandListingSectionChunk {...props}/>;
        case 'brands-landing':
            return (props) => <BrandsLandingSectionChunk {...props}/>;
        case 'brands-row-grid':
            return (props) => <BrandsRowGridSectionChunk {...props}/>;
        case 'cart-landing':
            return (props) => <CartLandingSectionChunk {...props}/>;
        case 'categories-listing':
            return (props) => <CategoriesListingSectionChunk {...props}/>;
        case 'categories':
            return (props) => <CategoriesSectionChunk {...props}/>;
        case 'category-collectibles':
            return (props) => <CategoryCollectiblesSectionChunk {...props}/>;
        case 'collection-listing':
            return (props) => <CollectionListingSectionChunk {...props}/>;
        case 'collections-listing':
            return (props) => <CollectionsListingSectionChunk {...props}/>;
        case 'collections':
            return (props) => <CollectionsSectionChunk {...props}/>;
        case 'contact-us':
            return (props) => <ContactUsSectionChunk {...props}/>;
        case 'custom-categories':
            return (props) => <CustomCategoriesSectionChunk {...props}/>;
        case 'custom-collection-listing':
            return (props) => <CustomCollectionListingSectionChunk {...props}/>;
        case 'designer':
            return (props) => <DesignerSectionChunk {...props}/>;
        case 'detail-component':
            return (props) => <DetailComponentSectionChunk {...props}/>;
        case 'exclusive-edition':
            return (props) => <ExclusiveEditionSectionChunk {...props}/>;
        case 'fashion-grid':
            return (props) => <FashionGridSectionChunk {...props}/>;
        case 'feature-blog':
            return (props) => <FeatureBlogSectionChunk {...props}/>;
        case 'featured-collection':
            return (props) => <FeaturedCollectionSectionChunk {...props}/>;
        case 'hero-banner':
            return (props) => <HeroBannerSectionChunk {...props}/>;
        case 'hero-image':
            return (props) => <HeroImageSectionChunk {...props}/>;
        case 'hero-video':
            return (props) => <HeroVideoSectionChunk {...props}/>;
        case 'image-gallery':
            return (props) => <ImageGallerySectionChunk {...props}/>;
        case 'image-slideshow':
            return (props) => <ImageSlideshowSectionChunk {...props}/>;
        case 'info-text':
            return (props) => <InfoTextSectionChunk {...props}/>;
        case 'link':
            return (props) => <LinkSectionChunk {...props}/>;
        case 'login':
            return (props) => <LoginSectionChunk {...props}/>;
        case 'media-with-text':
            return (props) => <MediaWithTextSectionChunk {...props}/>;
        case 'multi-collection-product-list':
            return (props) => <MultiCollectionProductListSectionChunk {...props}/>;
        case 'multi-recommendation-list':
            return (props) => <MultiRecommendationListSectionChunk {...props}/>;
        case 'newsletter-form':
            return (props) => <NewsletterFormSectionChunk {...props}/>;
        case 'order-details':
            return (props) => <OrderDetailsSectionChunk {...props}/>;
        case 'product-carousel':
            return (props) => <ProductCarouselSectionChunk {...props}/>;
        case 'product-collection-listing':
            return (props) => <ProductCollectionListingSectionChunk {...props}/>;
        case 'product-description':
            return (props) => <ProductDescriptionSectionChunk {...props}/>;
        case 'product-info':
            return (props) => <ProductInfoSectionChunk {...props}/>;
        case 'product-listing':
            return (props) => <ProductListingSectionChunk {...props}/>;
        case 'product-recommendation':
            return (props) => <ProductRecommendationSectionChunk {...props}/>;
        case 'products-slider':
            return (props) => <ProductsSliderSectionChunk {...props}/>;
        case 'raw-html':
            return (props) => <RawHtmlSectionChunk {...props}/>;
        case 'register':
            return (props) => <RegisterSectionChunk {...props}/>;
        case 'sitemap':
            return (props) => <SitemapSectionChunk {...props}/>;
        case 'sizing-help':
            return (props) => <SizingHelpSectionChunk {...props}/>;
        case 'testimonials':
            return (props) => <TestimonialsSectionChunk {...props}/>;
        case 'trust-marker':
            return (props) => <TrustMarkerSectionChunk {...props}/>;
            default:
                return null;
        }
    };


export default {
            'about-us': { ...AboutUsSectionChunk, Component: getbundle('about-us') },
        'application-banner': { ...ApplicationBannerSectionChunk, Component: getbundle('application-banner') },
        'banner-detail': { ...BannerDetailSectionChunk, Component: getbundle('banner-detail') },
        'blog': { ...BlogSectionChunk, Component: getbundle('blog') },
        'brand-listing': { ...BrandListingSectionChunk, Component: getbundle('brand-listing') },
        'brands-landing': { ...BrandsLandingSectionChunk, Component: getbundle('brands-landing') },
        'brands-row-grid': { ...BrandsRowGridSectionChunk, Component: getbundle('brands-row-grid') },
        'cart-landing': { ...CartLandingSectionChunk, Component: getbundle('cart-landing') },
        'categories-listing': { ...CategoriesListingSectionChunk, Component: getbundle('categories-listing') },
        'categories': { ...CategoriesSectionChunk, Component: getbundle('categories') },
        'category-collectibles': { ...CategoryCollectiblesSectionChunk, Component: getbundle('category-collectibles') },
        'collection-listing': { ...CollectionListingSectionChunk, Component: getbundle('collection-listing') },
        'collections-listing': { ...CollectionsListingSectionChunk, Component: getbundle('collections-listing') },
        'collections': { ...CollectionsSectionChunk, Component: getbundle('collections') },
        'contact-us': { ...ContactUsSectionChunk, Component: getbundle('contact-us') },
        'custom-categories': { ...CustomCategoriesSectionChunk, Component: getbundle('custom-categories') },
        'custom-collection-listing': { ...CustomCollectionListingSectionChunk, Component: getbundle('custom-collection-listing') },
        'designer': { ...DesignerSectionChunk, Component: getbundle('designer') },
        'detail-component': { ...DetailComponentSectionChunk, Component: getbundle('detail-component') },
        'exclusive-edition': { ...ExclusiveEditionSectionChunk, Component: getbundle('exclusive-edition') },
        'fashion-grid': { ...FashionGridSectionChunk, Component: getbundle('fashion-grid') },
        'feature-blog': { ...FeatureBlogSectionChunk, Component: getbundle('feature-blog') },
        'featured-collection': { ...FeaturedCollectionSectionChunk, Component: getbundle('featured-collection') },
        'hero-banner': { ...HeroBannerSectionChunk, Component: getbundle('hero-banner') },
        'hero-image': { ...HeroImageSectionChunk, Component: getbundle('hero-image') },
        'hero-video': { ...HeroVideoSectionChunk, Component: getbundle('hero-video') },
        'image-gallery': { ...ImageGallerySectionChunk, Component: getbundle('image-gallery') },
        'image-slideshow': { ...ImageSlideshowSectionChunk, Component: getbundle('image-slideshow') },
        'info-text': { ...InfoTextSectionChunk, Component: getbundle('info-text') },
        'link': { ...LinkSectionChunk, Component: getbundle('link') },
        'login': { ...LoginSectionChunk, Component: getbundle('login') },
        'media-with-text': { ...MediaWithTextSectionChunk, Component: getbundle('media-with-text') },
        'multi-collection-product-list': { ...MultiCollectionProductListSectionChunk, Component: getbundle('multi-collection-product-list') },
        'multi-recommendation-list': { ...MultiRecommendationListSectionChunk, Component: getbundle('multi-recommendation-list') },
        'newsletter-form': { ...NewsletterFormSectionChunk, Component: getbundle('newsletter-form') },
        'order-details': { ...OrderDetailsSectionChunk, Component: getbundle('order-details') },
        'product-carousel': { ...ProductCarouselSectionChunk, Component: getbundle('product-carousel') },
        'product-collection-listing': { ...ProductCollectionListingSectionChunk, Component: getbundle('product-collection-listing') },
        'product-description': { ...ProductDescriptionSectionChunk, Component: getbundle('product-description') },
        'product-info': { ...ProductInfoSectionChunk, Component: getbundle('product-info') },
        'product-listing': { ...ProductListingSectionChunk, Component: getbundle('product-listing') },
        'product-recommendation': { ...ProductRecommendationSectionChunk, Component: getbundle('product-recommendation') },
        'products-slider': { ...ProductsSliderSectionChunk, Component: getbundle('products-slider') },
        'raw-html': { ...RawHtmlSectionChunk, Component: getbundle('raw-html') },
        'register': { ...RegisterSectionChunk, Component: getbundle('register') },
        'sitemap': { ...SitemapSectionChunk, Component: getbundle('sitemap') },
        'sizing-help': { ...SizingHelpSectionChunk, Component: getbundle('sizing-help') },
        'testimonials': { ...TestimonialsSectionChunk, Component: getbundle('testimonials') },
        'trust-marker': { ...TrustMarkerSectionChunk, Component: getbundle('trust-marker') },
        };