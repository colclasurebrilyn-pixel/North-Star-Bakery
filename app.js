const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
const filterStatus = document.querySelector('#filter-status');
const productCategories = [
  { filter: 'bread', element: document.querySelector('#breads'), label: 'Breads' },
  { filter: 'pastry', element: document.querySelector('#pastries'), label: 'Pastries' },
  { filter: 'cake', element: document.querySelector('#cakes'), label: 'Cakes' }
];
const filterStorageKey = 'northStarBakeryProductFilter';

function setProductFilter(filter) {
  const selectedFilter = filterButtons.some((button) => button.dataset.filter === filter) ? filter : 'all';
  const visibleProducts = productCategories.filter((product) => (
    selectedFilter === 'all' || product.filter === selectedFilter
  ));

  productCategories.forEach((product) => {
    product.element.hidden = !visibleProducts.includes(product);
  });
  filterButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === selectedFilter));
  });
  filterStatus.textContent = selectedFilter === 'all'
    ? `Showing all ${visibleProducts.length} product categories.`
    : `Showing ${visibleProducts[0].label.toLowerCase()}.`;

  try {
    localStorage.setItem(filterStorageKey, selectedFilter);
  } catch (error) {
    console.error('Could not save the product filter preference.', error);
  }
}

if (filterButtons.length && filterStatus) {
  let savedFilter = 'all';
  try {
    savedFilter = localStorage.getItem(filterStorageKey) || 'all';
  } catch (error) {
    console.error('Could not load the product filter preference.', error);
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => setProductFilter(button.dataset.filter));
  });
  setProductFilter(savedFilter);
}

const preorderForm = document.querySelector('#preorder-form');

if (preorderForm) {
  const formStatus = document.querySelector('#form-status');
  const fields = [
    {
      input: preorderForm.elements.name,
      error: document.querySelector('#name-error'),
      validate: (input) => {
        if (!input.value.trim()) return 'Please enter your name.';
        if (input.value.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      }
    },
    {
      input: preorderForm.elements.email,
      error: document.querySelector('#email-error'),
      validate: (input) => {
        if (!input.value.trim()) return 'Please enter your email address.';
        if (!input.validity.valid) return 'Enter a valid email address, such as name@example.com.';
        return '';
      }
    },
    {
      input: preorderForm.elements['request-type'],
      error: document.querySelector('#request-type-error'),
      validate: (input) => input.value ? '' : 'Please choose what you need help with.'
    },
    {
      input: preorderForm.elements['pickup-date'],
      error: document.querySelector('#pickup-date-error'),
      validate: (input) => {
        if (!input.value) return 'Please choose a requested pickup date.';
        const today = new Date();
        const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10);
        if (input.value < localToday) return 'Choose today or a future date.';
        return '';
      }
    },
    {
      input: preorderForm.elements.details,
      error: document.querySelector('#details-error'),
      validate: (input) => {
        if (!input.value.trim()) return 'Please describe the items and quantity.';
        if (input.value.trim().length < 5) return 'Please add a little more detail (at least 5 characters).';
        return '';
      }
    }
  ];

  function validateField(field) {
    const message = field.validate(field.input);
    field.error.textContent = message;
    field.input.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  }

  fields.forEach((field) => {
    field.input.addEventListener('input', () => {
      if (field.input.getAttribute('aria-invalid') === 'true') validateField(field);
      formStatus.textContent = '';
    });
    field.input.addEventListener('change', () => {
      if (field.input.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  preorderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalidFields = fields.filter((field) => !validateField(field));
    if (invalidFields.length) {
      formStatus.textContent = 'Please correct the highlighted fields and try again.';
      invalidFields[0].input.focus();
      return;
    }

    const name = preorderForm.elements.name.value.trim();
    formStatus.textContent = `Thanks, ${name}. Your request is ready for the bakery team to review.`;
    preorderForm.reset();
    fields.forEach((field) => {
      field.error.textContent = '';
      field.input.removeAttribute('aria-invalid');
    });
  });
}
