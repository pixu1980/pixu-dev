<template>
  <div class="layout">
    <Header />
    <Nav />
    <main>
      <slot />
    </main>
  </div>
</template>

<script>
import Header from "../components/Header";
import Nav from "../components/Nav";

export default {
  components: {
    Header,
    Nav,
  },
};
</script>
