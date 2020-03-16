eventBus = new Vue();

Vue.component('product-details', {
	props: {
		details: {
			type: Array,
			required: true
		}
	},
	template: `
		<ul>
			<li v-for="detail in details">
				{{ detail }}
			</li>
		</ul>
	`
});

Vue.component('product', {
	props: {
		premium: {
			type: Boolean,
			required: true
		}
	},
	template: `
	<div class="product">
		<div class="product-image">
			<img v-bind:src="image" alt="socks-img" />
		</div>

		<div class="product-info">
			<h1>{{title}}</h1>
			<p v-if="inStock">In Stock</p>
			<p v-else :class="{outOfStock: !inStock}">
				Out Of Stock
			</p>
			<p>Shipping: {{shipping}} </p>
			<p>{{ sale }}</p>

			<product-details :details="details"></product-details>

			<div
				v-for="(variant, index) in variants"
				:key="variant.variantId"
				class="color-box"
				:style="{backgroundColor: variant.variantColor}"
				@mouseover="updateProduct(index)"
			></div>

			<!-- or @click="addToCart" -->
			<button
				v-on:click="addToCart" 
				:disable="!inStock"
				:class="{disabledButton: !inStock}"
			>
				Add to Cart
			</button>
		
			<button
				v-on:click="removeFromCart"
				:disable="!inStock"
				:class="{disabledButton: !inStock}"
			>
				Remove from Cart
			</button>

		</div>

		<product-tabs :reviews="reviews"></product-tabs>
	
	</div>
	`,
	data() {
		return {
			brand: 'Vue',
			product: 'Socks',
			details: ['80% cotton', '20% polyester', 'Gender-neutral'],
			selectedVariant: 0,
			variants: [
				{
					variantId: 2234,
					variantColor: 'green',
					variantQuantity: 0,
					variantImage: './assets/vmSocks-green-onWhite.jpg'
				},
				{
					variantId: 2235,
					variantColor: 'blue',
					variantQuantity: 10,
					variantImage: './assets/vmSocks-blue-onWhite.jpg'
				}
			],
			onSale: true,
			reviews: []
		};
	},
	methods: {
		addToCart() {
			this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
		},
		removeFromCart() {
			this.$emit(
				'remove-from-cart',
				this.variants[this.selectedVariant].variantId
			);
		},
		updateProduct(index) {
			this.selectedVariant = index;
		}
	},
	computed: {
		title() {
			return this.brand + ' ' + this.product;
		},
		image() {
			return this.variants[this.selectedVariant].variantImage;
		},
		inStock() {
			return this.variants[this.selectedVariant].variantQuantity;
		},
		sale() {
			if (this.onSale) {
				return `${this.brand} ${this.product} are On Sale!`;
			}
			return `${this.brand} ${this.product} are NOT On Sale`;
		},
		shipping() {
			if (this.premium) return 'Free';
			return '$2.99';
		}
	},
	mounted() {
		eventBus.$on('review-submitted', productReview => {
			this.reviews.push(productReview);
		});
	}
});

Vue.component('product-review', {
	template: `
		<form class="review-form" @submit.prevent="onSubmit">

			<p v-if="errors.length"> 
				<b> Please correct the following error(s): </b>
				<ul v-for="error in errors">
					<li>{{ error }}</li>
				</ul>
			</p>

			<p>
				<label for="name">Name:</label>
				<input id="name" v-model="name">
			</p>

			<p>
				<label for="review">Review:</label>
				<textarea id="review" v-model="review"></textarea>
			</p>

			<p>
				<label for="rating">Rating:</label>
				<select id="rating" v-model.number="rating">
					<option>5</option>
					<option>4</option>
					<option>3</option>
					<option>2</option>
					<option>1</option>
				</select>
			</p>

				<p> Would you recommend this product? </p>
				<p>
					<label for="yes">Yes, definetly.
					<input type="radio" id="yes" name="recommend" value="Yes" v-model="recommend">
					</label>
				</p>
				<p>
					<label for="no">No, no way.
					<input type="radio" id="no" name="recommend" value="No" v-model="recommend">
					</label>
				</p>

			<button>Submit</button>
		</form>
	`,
	data() {
		return {
			name: null,
			review: null,
			rating: null,
			errors: [],
			recommend: null
		};
	},
	methods: {
		onSubmit() {
			if (this.name && this.rating && this.review) {
				let productReview = {
					name: this.name,
					review: this.review,
					rating: this.rating,
					recommend: this.recommend
				};
				eventBus.$emit('review-submitted', productReview);
				this.name = null;
				this.review = null;
				this.rating = null;
				this.recommend = null;
			} else {
				if (!this.name && !this.errors.includes('Name required.'))
					this.errors.push('Name required.');
				if (!this.review && !this.errors.includes('Review required.'))
					this.errors.push('Review required.');
				if (!this.rating && !this.errors.includes('Rating required.'))
					this.errors.push('Rating required.');
			}
		}
	}
});

Vue.component('product-tabs', {
	props: {
		reviews: {
			type: Array,
			required: true
		}
	},
	template: `
	<div>
		<span class="tab"
					:class="{activeTab: selectedTab === tab}"
					v-for="(tab, index) in tabs" :key="index" @click="selectedTab = tab">
					{{ tab }}
					</span>

		<div v-show="selectedTab === 'Reviews'">
			<h2>Reviews</h2>
			<p v-if="!reviews.length">There are no reviews yet.</p>
			<ul>
				<li v-for="review in reviews"> 
					<p> {{review.name}} </p>
					<p>Rating {{review.rating}} </p>
					<p> {{review.review}} </p>
				</li>
			</ul>

			<product-review 
				v-show="selectedTab === 'Make a Review'"
			></product-review>

		</div>

	</div>
	`,
	data() {
		return {
			tabs: ['Reviews', 'Make a Review'],
			selectedTab: 'Reviews'
		};
	}
});

var app = new Vue({
	el: '#app',
	data: {
		premium: true,
		cart: []
	},
	methods: {
		addItem(id) {
			this.cart.push(id);
		},
		removeItem(id) {
			this.cart.pop(id);
		}
	}
});
