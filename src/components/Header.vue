<template>
  <header>
    <a href="#" class="hamburger aside-nav--open" title="Open Menu" aria-label="Open Menu">
      <font-awesome :icon="['fas', 'bars']" />
    </a>
    <h1 title="Emiliano Pisu - UI/UX Engineer">Emiliano Pisu <span class="text-primary">UI/UX Engineer</span></h1>
  </header>
</template>

<script>
export default {
  mounted() {
    const aside = document.querySelector("aside");
    const asideOpen = document.querySelector(".aside-nav--open");

    asideOpen.addEventListener("click", () => {
      aside.classList.toggle("open");
    });
  },
};
</script>
