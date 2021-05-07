<template>
  <aside>
    <nav>
      <figure
        v-on:click="scrollTo('#about')"
        v-on:mouseover="
          () => {
            figureHovered = true;
            figureAnimationMode = 'enter';
          }
        "
        v-on:mouseleave="
          () => {
            figureHovered = false;
            figureAnimationMode = 'leave';
          }
        "
        v-bind:style="{
          '--animation-name': figureHovered && figureAnimationMode === 'enter' ? 'portrait-enter' : 'portrait-leave',
          '--animation-duration': !!figureAnimationMode ? '.7s' : '0',
          '--translate-x': figureAnimationMode === 'enter' ? 0 : '-120%',
        }"
      >
        <g-image alt="profile of Emiliano Pisu" src="~/assets/images/profile.png" />
        <g-image alt="portrait of Emiliano Pisu" src="../assets/images/portrait.jpg" />
      </figure>
      <ul>
        <li>
          <a v-on:click="scrollTo('#about')">About</a>
        </li>
        <li>
          <a v-on:click="scrollTo('#education')">Education</a>
        </li>
        <li>
          <a v-on:click="scrollTo('#skills')">Skills</a>
        </li>
        <li>
          <a v-on:click="scrollTo('#projects')">Projects</a>
        </li>
        <li>
          <a v-on:click="scrollTo('#awards')">Awards</a>
        </li>
        <li>
          <a v-on:click="scrollTo('#experience')">Experience</a>
        </li>
        <li>
          <a v-on:click="scrollTo('#interests')">Interests</a>
        </li>
      </ul>
      <Links />
    </nav>
    <a href="#" class="aside-nav--close" title="Close Menu" aria-label="Close Menu"></a>
  </aside>
</template>

<script>
import Links from "../components/Links";

export default {
  aside: null,
  asideClose: null,
  components: {
    Links,
  },
  methods: {
    scrollTo(id) {
      this.aside.classList.remove("open");
      this.$scrollTo(id, 500, { offset: -document.querySelector("header").getBoundingClientRect().height });
    },
  },
  data() {
    return {
      figureHovered: false,
      figureAnimationMode: null,
    };
  },
  mounted() {
    this.aside = document.querySelector("aside");
    this.asideClose = document.querySelector(".aside-nav--close");

    // set focus to our open/close buttons after animation
    this.aside.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "transform") return;

      this.aside.classList.contains("open") && this.asideClose.focus();
    });

    this.asideClose.addEventListener("click", () => {
      this.aside.classList.remove("open");
    });

    // close our menu when esc is pressed
    this.aside.addEventListener("keyup", (e) => {
      if (e.code === "Escape") this.aside.classList.remove("open");
    });
  },
};
</script>
