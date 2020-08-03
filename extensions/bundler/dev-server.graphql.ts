import gql from 'graphql-tag';
import { Schema } from '@bit/bit.core.graphql';
import { BundlerExtension } from './bundler.extension';
import { Component } from '@bit/bit.core.component';

export function devServerSchema(bundler: BundlerExtension): Schema {
  return {
    typeDefs: gql`
      extend type Component {
        server: ComponentServer
      }

      type ComponentServer {
        env: String
        url: String
      }
    `,
    resolvers: {
      Component: {
        server: (component: Component) => {
          const componentServer = bundler.getComponentServer(component);
          if (!componentServer) return {};

          return {
            env: componentServer.env.id,
            url: componentServer.url,
          };
        },
      },
    },
  };
}
