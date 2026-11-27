import { PHOTOS } from "../lib/photos";

/** A glimpse of the real dashboard in a soft device frame, for the log in and sign-up panels. */
function ProductPeek() {
    return (
        <figure className="product-peek" aria-hidden="true">
            <img src={PHOTOS.product} alt="" width={1800} height={1013} loading="lazy" />
        </figure>
    );
}

export default ProductPeek;
