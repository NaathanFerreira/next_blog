import React from 'react';
import { GetStaticProps } from 'next';
import Header from '../components/Header';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { resolvePtr } from 'dns';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export function formatDate(date) {
  return format(new Date(date), 'PP', {
    locale: ptBR,
  });
}

export default function Home({ postsPagination }: HomeProps) {
  const [postList, setPostLit] = React.useState<PostPagination>(null);

  React.useEffect(() => {
    setPostLit({ ...postsPagination });
  }, []);

  async function loadNextPage() {
    const resp = await fetch(postList.next_page);
    const data = await resp.json();

    setPostLit({
      ...postList,
      next_page: data.next_page ? data.next_page : null,
      results: [...postList.results, ...data.results],
    });
  }

  return (
    <div className={commonStyles.contentContainer}>
      <Header />
      <div className={styles.posts}>
        {postList &&
          postList.results.map(post => {
            return (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a>
                  <strong>{post.data.title}</strong>
                  <p>{post.data.subtitle}</p>
                  <div>
                    <span>
                      <FiCalendar /> {formatDate(post.first_publication_date)}
                    </span>
                    <span>
                      <FiUser /> {post.data.author}
                    </span>
                  </div>
                </a>
              </Link>
            );
          })}
      </div>
      {postList && postList.next_page && (
        <button
          className={styles.nextPageButton}
          onClick={() => loadNextPage()}
        >
          Carregar mais posts
        </button>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', { pageSize: 1 });
  // console.log(postsResponse);
  const postsPagination = { ...postsResponse };
  // console.log(JSON.stringify(postsResponse, null, 2));
  return {
    props: { postsPagination },
  };
};
