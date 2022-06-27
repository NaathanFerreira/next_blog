import React from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { formatDate } from '..';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  // TODO

  const fullContentText = post.data.content.reduce(
    (previousValue, currentValue) => {
      const bodyText = RichText.asText(currentValue.body);
      return previousValue + bodyText;
    },
    ''
  );

  const numberOfWords = fullContentText.split(' ').length;
  const minutesToRead = Math.round(numberOfWords / 200);

  return (
    <>
      <div className={commonStyles.contentContainer}>
        <Header />
      </div>
      {post ? (
        <div>
          <img src={post.data.banner.url} alt="banner" className={styles.img} />
          <div className={commonStyles.contentContainer}>
            <div className={styles.post}>
              <strong className={styles.title}>{post.data.title}</strong>
              <div className={styles.infos}>
                <span>
                  <FiCalendar /> {formatDate(post.first_publication_date)}
                </span>
                <span>
                  <FiUser /> {post.data.author}
                </span>
                <span>
                  <FiClock /> {minutesToRead} min
                </span>
              </div>
              <div className={styles.postContent}>
                {post.data.content.map((textContent, index) => {
                  return (
                    <article key={index}>
                      <h4>{textContent.heading}</h4>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: RichText.asHtml(textContent.body),
                        }}
                      />
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Carregando...</p>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient({});
  // const posts = await prismic.getByType(TODO);

  return {
    paths: [
      {
        params: {
          slug: 'crucifixo-inclinado',
        },
      },
    ],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug));

  const post = { ...response };

  return {
    props: { post },
    revalidate: 60 * 30, // 30 minutos
  };
};
