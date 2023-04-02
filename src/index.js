import axios from 'axios';
import { Notify } from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '34995094-3137eae5ca5d9e0be5780a27e';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let searchQuery = '';
let page = 1;

searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);
loadMoreBtn.classList.add('is-hidden')

function onSearch(e) {
  e.preventDefault();
  searchQuery = e.currentTarget.elements.searchQuery.value.trim();
  page = 1;
  clearGallery();
  fetchImages();
}

function onLoadMore() {
  page += 1;
  fetchImages();
}

async function fetchImages() {
  if(searchQuery === '') {
    loadMoreBtn.classList.add('is-hidden')
    return
  }
  const url = `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;
  loadMoreBtn.disabled = true;
  try {
    const response = await axios.get(url)
    const hits = response.data.hits
    const totalHits = response.data.totalHits
    if (hits.length === 0 && page === 1) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return
    }
    appendImagesMarkup(hits)
    var lightbox = new SimpleLightbox('.gallery a', {})
    if(page === 1) {
      Notify.success(`Hooray! We found ${totalHits} images.`)
    }
    loadMoreBtn.disabled = false;
    if (hits.length < 40) {
      loadMoreBtn.classList.add('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}

function appendImagesMarkup(images) {
  gallery.insertAdjacentHTML(
    'beforeend',
    images
      .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
        return `
          <a href="${largeImageURL}" class="gallery__item">
            <div class="photo-card">
                <img 
                class="gallery__image"
                src="${webformatURL}" 
                data-source="${largeImageURL}" 
                alt="${tags}" 
                loading="lazy" 
                width="230" height="160" />
              <div class="info">
                <p class="info-item">
                  <b>Likes:</b> ${likes}
                </p>
                <p class="info-item">
                  <b>Views:</b> ${views}
                </p>
                <p class="info-item">
                  <b>Comments:</b> ${comments}
                </p>
                <p class="info-item">
                  <b>Downloads:</b> ${downloads}
                </p>
              </div>
            </div>
          </a>
        `;
      })
      .join(''),
  );
}

function clearGallery() {
  gallery.innerHTML = '';
  loadMoreBtn.classList.remove('is-hidden');
}
